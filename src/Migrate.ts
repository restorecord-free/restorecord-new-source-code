import axios from "axios";

export async function addMember(guildId: string, userId: string, botToken: any, access_token: string, roles: string[]) {
    return await axios.put(`https://discordapp.com/api/guilds/${guildId}/members/${userId}`, {
        access_token: access_token,
        roles: roles,
        ValidateStatus: () => true
    }, {
        headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json",
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}

export async function addRole(guildId: string, userId: string, botToken: any, roleId: string) {
    return await axios.put(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
        ValidateStatus: () => true
    }, {
        headers: {
            "Authorization": `Bot ${botToken}`,
            "Content-Type": "application/json",
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}

export async function refreshToken(refreshToken: string, clientId: string, clientSecret: string) {
    return await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        }
    })
        .then(async (res: any) => { return res; })
        .catch(async (err: any) => { return err; });
}

export async function refreshTokenAddDB(userId: any, memberId: any, guildId: any, botToken: any, roleId: any, refreshToken: any, clientId: any, clientSecret: any, prisma: any) {
    return await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        }
    })
        .then(async (resp) => {
            if (resp.data.access_token && resp.data.refresh_token) {
                await prisma.members.update({
                    where: {
                        id: memberId
                    },
                    data: {
                        accessToken: resp.data.access_token,
                        refreshToken: resp.data.refresh_token
                    }
                });
                await addMember(guildId, userId, botToken, resp.data.access_token, [BigInt(roleId).toString()])
            }
        })
        .catch(async (err) => { console.log(err); });
}

export async function exchange(code: string, redirect_uri: string, client_id: any, client_secret: any) {
    const request = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },

        body: new URLSearchParams({
            client_id: client_id,
            client_secret: client_secret,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirect_uri,
            scope: "identify+guilds.join",
        }),
    });

    return await request.json();
}

export async function resolveUser(token: string): Promise<User> {
    const request = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${token}`,
            "X-RateLimit-Precision": "millisecond",
            "User-Agent": "DiscordBot (https://discord.js.org, 0.0.0)",
        },
    });

    const response: User = await request.json();

    if (!response.id) {
        return null as any;
    }

    return response;
}


interface User {
	id: number;
	username: string;
	discriminator: string;
	avatar: string;
	bot?: boolean;
	system?: boolean;
	mfa_enabled?: boolean;
	banner?: string;
	accent_color?: number;
	locale?: string;
	verified?: boolean;
	flags?: string;
}


export async function  shuffle(array: any) {
    let currentIndex = array.length,  randomIndex;

    while (currentIndex != 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}


export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}