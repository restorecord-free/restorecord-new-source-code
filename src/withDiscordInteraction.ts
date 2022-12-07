import axios from "axios"
import { APIApplicationCommand, APIChatInputApplicationCommandInteraction } from "discord-api-types/v10"
import { NextApiRequest, NextApiResponse } from "next"
import nacl from "tweetnacl"
import { prisma } from "./db"

const verifyHeaders = (timestamp: any, rawBody: any, signature: any, public_key: any) => {
    return nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody),
        Buffer.from(signature, "hex"),
        Buffer.from(public_key, "hex")
    )
}

const withDiscordInteraction = (next: any) => async (
    req: NextApiRequest,
    res: NextApiResponse
) => {
    const signature = req.headers["x-signature-ed25519"]
    const timestamp = req.headers["x-signature-timestamp"]
    if (typeof signature !== "string" || typeof timestamp !== "string") {
        return res.status(401).end("invalid request signature")
    }

    try {
        const rawBody = await parseRawBodyAsString(req)
        const interaction: APIChatInputApplicationCommandInteraction = JSON.parse(rawBody);
        if (!interaction) { return res.status(401).end("invalid request signature") }

        const { type, application_id } = interaction
        if (!type || !application_id) { return res.status(401).end("invalid request signature") }

        const cBot = await prisma.customBots.findFirst({
            where: {
                clientId: BigInt(application_id)
            }
        })

        if (!cBot) return res.status(400).end("invalid application id")

        if (cBot.publicKey === null) return res.status(400).end("invalid public key")

        const isVerified = verifyHeaders(timestamp, rawBody, signature, cBot.publicKey)
        if (!isVerified) {
            return res.status(401).end("Request does not come from Discord (invalid signature)")
        }

        // @ts-ignore
        if (type === 1) {
            return res.status(200).json({ type: 1 })
        } else {
            return await next(req, res, interaction)
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            statusCode: 500,
            message: "Oops, something went wrong parsing the request!",
        })
    }
}

export default withDiscordInteraction;

export type CreateGlobalCommand = Omit<APIApplicationCommand, "id" | "application_id">
export function createGlobalCommand(token: any, clientid: any, command: CreateGlobalCommand) {
    return axios.post<APIApplicationCommand>(`https://discord.com/api/v10/applications/${clientid}/commands`, command, {
        headers: {
            Authorization: `Bot ${token}`
        }
    })
}

export const parseRawBodyAsString = (req: NextApiRequest) =>
    new Promise<string>((resolve) => {
        let data = ""
        req.on("data", (chunk) => {
            data += chunk
        })
        req.on("end", () => {
            resolve(Buffer.from(data).toString())
        })
    })