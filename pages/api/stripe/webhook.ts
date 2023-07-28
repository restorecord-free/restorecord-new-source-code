import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import { prisma } from "../../../src/db";
import Stripe from "stripe";
import axios from "axios";

export const config = {
    api: {
        bodyParser: false,
    },
};

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2022-11-15", typescript: true });
//const stripe = new Stripe("sk_test_51LntpRIDsTail4YBlix309uMRctzdtJaNiTRMNgncRs6KPmeQJGIMeJKXSeCbosHRBTaGnaySMgbtfzJFqEUiUHL002RZTmipV", { apiVersion: "2022-11-15", typescript: true, });

async function buffer(readable: Readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

async function postWebhook(subscription: any, account: any, status: string, description = "") {
    if (description === "") description = `Subscription status is ${status}. ${subscription.cancel_at_period_end ? `(Plan ends: __${new Date(subscription.cancel_at * 1000).toLocaleString()})__` : ""}`;

    await axios.post(`https://discord.com/api/webhooks/1053705505899548692/9LRHelRG4dmnSNR2Ili3Ab2SiyS96zHSz0Gy4o9g0GDsmdA6ZLli2CLlid7b0hQNd7rL`, {
        embeds: [
            {
                title: "Subscription Updated",
                description: description,
                color: subscription.cancel_at_period_end ? 0xFFFF00 : status === "active" ? 0x00ff12 : 0xff0000,
                fields: [
                    {
                        name: "Subscription ID",
                        value: `||${subscription.id}||`,
                        inline: true
                    },
                    {
                        name: "Current Period End",
                        value: `<t:${Math.floor(subscription.current_period_end)}:F>`,
                        inline: true
                    },
                    {
                        name: "Status",
                        value: status === "active" ? `:white_check_mark: ${status}` : status === "trialing" ? `:hourglass: ${status}` : `:x: ${status}`,
                        inline: true
                    },
                    {
                        name: "Account ID",
                        value: `**${subscription.metadata.account_id} ${account ? `(${account.username})` : ""}**`,
                        inline: true
                    },
                    {
                        name: "Plan",
                        value: subscription.metadata.plan.slice(0, 1).toUpperCase() + subscription.metadata.plan.slice(1),
                        inline: true
                    },
                    {
                        name: "Amount",
                        value: `$${subscription.plan.amount / 100}`,
                        inline: true
                    },
                ]
            },
        ]
    }).catch(err => console.error(err));
}

// look up array of price ids and the plan name + expiry
const priceIds: { [key: string]: { plan: string; expiry: number } } = {
    "price_1MVilQIDsTail4YBuxkF8JRc": { plan: "business", expiry: 31536000 },
    "price_1MakYkIDsTail4YBS7RWBqQL": { plan: "business_monthly", expiry: 2592000 },
    "price_1MVilKIDsTail4YBdF2GvIUi": { plan: "premium", expiry: 31536000 },
    "price_1MakYlIDsTail4YBvmoAoG37": { plan: "premium_monthly", expiry: 2592000 },

    // stripe test data:
    "price_1MSt40IDsTail4YBGWYS6YvP": { plan: "business", expiry: 31536000 },
    "price_1MSks7IDsTail4YBgM8FFLTg": { plan: "premium", expiry: 31536000 },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let event;
        let subscription: any;
        let status: string;

        const buf = await buffer(req);
        //const endpointSecret = "whsec_V36i82Fn70v9edAJHKeKwykhUI8bFLBt";
        const endpointSecret = "whsec_J2ZCMxWPvKeaStSWl4r1RdSnvTu39Gix";
        if (endpointSecret) {
            const signature: any = req.headers["stripe-signature"];
            try {
                event = stripe.webhooks.constructEvent(buf, signature, endpointSecret);
            } catch (err: any) {
                console.log(`[STRIPE] ⚠️ Webhook signature verification failed.`, err.message);
                return res.status(400).end();
            }
        }
        if (!event) return res.status(400).json({ success: false, message: "Event not found." });

        console.log(`[${event.type}] ${JSON.stringify(event.data.object)}`);

        switch (event.type) {
        case "customer.subscription.created":
            subscription = event.data.object;
            status = subscription.status;

            var planFull = priceIds[subscription.items.data[0].price.id].plan;
            var plan = planFull.replace("_monthly", "");

            console.log(event.type, subscription, status)

            const payment = await prisma.payments.findUnique({ where: { subscriptionId: subscription.id } });
            if (!payment) {
                await prisma.payments.create({
                    data: {
                        subscriptionId: subscription.id,
                        accountId: Number(subscription.metadata.account_id) as number,
                        type: subscription.metadata.plan,
                        amount: subscription.plan.amount,
                        payment_status: status,
                    }
                });
            }

            if (status === "trialing") {
                const payment = await prisma.payments.findUnique({
                    where: {
                        subscriptionId: subscription.id
                    }
                });

                if (subscription.metadata.plan !== planFull) {
                    await stripe.subscriptions.update(subscription.id, {
                        metadata: {
                            plan: planFull,
                        }
                    });
                }

                if (payment) {
                    await prisma.payments.update({
                        where: {
                            id: payment.id
                        },
                        data: {
                            payment_status: status,
                            amount: subscription.plan.amount,
                            type: planFull
                        }
                    });

                    await prisma.accounts.update({
                        where: {
                            id: Number(payment.accountId) as number
                        },
                        data: {
                            role: plan,
                            expiry: new Date(subscription.current_period_end * 1000)
                        }
                    });

                    await prisma.servers.updateMany({
                        where: {
                            ownerId: Number(payment.accountId) as number,
                            pullTimeout: {
                                gt: new Date()
                            }
                        },
                        data: {
                            pullTimeout: new Date()
                        }
                    });
                }
            }

            break;
        case "customer.subscription.deleted":
            subscription = event.data.object;
            status = subscription.status;

            console.log(event.type, subscription, status)

            if (status === "canceled") {
                let account;
                if (subscription.metadata.account_id) account = await prisma.accounts.findUnique({ where: { id: Number(subscription.metadata.account_id) as number } });

                await postWebhook(subscription, account, status, `Subscription canceled. ${subscription?.cancellation_details?.reason ? `Reason: ${subscription?.cancellation_details?.reason}` : ""} ${subscription?.cancellation_details?.comment ? `Comment: ${subscription?.cancellation_details?.comment}` : ""} ${subscription?.cancellation_details?.feedback ? `Feedback: ${subscription?.cancellation_details?.feedback}` : ""}`);

                await prisma.accounts.update({
                    where: {
                        id: Number(subscription.metadata.account_id) as number
                    },
                    data: {
                        role: "free",
                        expiry: null
                    }
                });

                // reset all servers
                await prisma.servers.updateMany({
                    where: {
                        ownerId: Number(subscription.metadata.account_id) as number,
                    },
                    data: {
                        picture: "https://cdn.restorecord.com/logo512.png",
                        vpncheck: false,
                        webhook: "",
                        bgImage: "",
                        description: "Verify to view the rest of the server.",
                        themeColor: "4f46e5",
                    }
                });
            }
            break;
        case "customer.subscription.updated":
            subscription = event.data.object;
            status = subscription.status;

            console.log(event.type, subscription, status)

            var planFull = priceIds[subscription.items.data[0].price.id].plan;
            var plan = planFull.replace("_monthly", "");

            if (status !== "incomplete" && status !== "incomplete_expired") {
                let account;
                if (subscription.metadata.account_id) account = await prisma.accounts.findUnique({ where: { id: Number(subscription.metadata.account_id) as number } });

                await postWebhook(subscription, account, status);
            }

            if (status === "active" || status === "trialing") {
                console.log(`[STRIPE] Subscription status is ${status}.`);

                const payment = await prisma.payments.findUnique({
                    where: {
                        subscriptionId: subscription.id
                    }
                });


                // update the metadata on stripe if its not the same
                if (subscription.metadata.plan !== planFull) {
                    await stripe.subscriptions.update(subscription.id, {
                        metadata: {
                            plan: planFull,
                        }
                    });
                }

                if (payment) {
                    await prisma.payments.update({
                        where: {
                            id: payment.id
                        },
                        data: {
                            payment_status: status,
                            amount: subscription.plan.amount,
                            type: planFull
                        }
                    });

                    await prisma.accounts.update({
                        where: {
                            id: Number(payment.accountId) as number
                        },
                        data: {
                            role: plan,
                            expiry: new Date(subscription.current_period_end * 1000)
                        }
                    });

                    await prisma.servers.updateMany({
                        where: {
                            ownerId: Number(payment.accountId) as number,
                            pullTimeout: {
                                gt: new Date()
                            }
                        },
                        data: {
                            pullTimeout: new Date()
                        }
                    });
                } else {
                    console.error(`[STRIPE] Payment not found for subscription ${subscription.id}`);

                    await prisma.payments.create({
                        data: {
                            subscriptionId: subscription.id,
                            accountId: Number(subscription.metadata.account_id) as number,
                            type: subscription.metadata.plan,
                            amount: subscription.plan.amount,
                            payment_status: status,
                        }
                    });

                    await prisma.accounts.update({
                        where: {
                            id: Number(subscription.metadata.account_id) as number
                        },
                        data: {
                            role: plan,
                            expiry: new Date(subscription.current_period_end * 1000)
                        }
                    });
                }
            }
            break;
        }

        return res.status(200).json({ success: true });
    } catch (err: any) {
        console.error(err);
        return res.status(200).json({ success: false, message: "Something went wrong" });
    }
}