import { useRouter } from "next/router";
import { useQuery } from "react-query"
import { useToken } from "../../src/token";
import { countries } from "./blacklist";
import { getMemberList, getMemberStats } from "../../src/dashboard/getMembers";

import NavBar from "../../components/dashboard/navBar";
import getUser from "../../src/dashboard/getUser";
import theme from "../../src/theme";

import dynamic from "next/dynamic";
import Link from "next/link";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/lab/Alert";
import AlertTitle from "@mui/lab/AlertTitle";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Stack from "@mui/material/Stack";

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function Dashboard() {
    const [ token ]: any = useToken()
    const router = useRouter();

    const { data, isError, isLoading } = useQuery("user", async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: true });

    const { data: memberList, isError: isError2, isLoading: isLoading2, refetch: refetchMemberList } = useQuery("memberList", async () => await getMemberList({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }), { retry: false });

    const { data: recentVerified, isError: recentVerifiedError, isLoading: recentVerifiedLoading } = useQuery("recentVerified", async () => await getMemberStats({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, "recent", 6), { retry: false });

    const { data: topCountries, isError: topCountriesError, isLoading: topCountriesLoading } = useQuery("topCountries", async () => await getMemberStats({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token,
    }, "country", 10), { retry: false });

    const { data: newsData, isError: newsError, isLoading: newsLoading } = useQuery("news", async () => await fetch("/api/v2/news").then(res => res.json()), { retry: false });

    if (isLoading || isLoading2 || newsLoading || recentVerifiedLoading || topCountriesLoading) return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    if (isError || isError2 || newsError || recentVerifiedError || topCountriesError) return <div>Error</div>

    if (!data || !data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <CircularProgress sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />
    }

    const apexChart: any = {
        options: {
            chart: {
                id: "members",
                type: "area",
                foreColor: "#fff",
                dropShadow: {
                    enabled: true,
                    top: 0,
                    left: 0,
                    blur: 3,
                    opacity: 0.5
                },
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false
                },
                sparkline: {
                    enabled: false
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                colors: [
                    theme.palette.primary.main,
                    theme.palette.error.main,
                    theme.palette.warning.main,
                    theme.palette.info.main,
                    theme.palette.success.main,
                    theme.palette.secondary.main,
                ],
                curve: "smooth",
            },
            legend: {
                horizontalAlign: "left"
            },
            plotOptions: {
                bar: {
                    columnWidth: "30%",
                    horizontal: false,
                },
            },
            fill: {
                colors: [
                    theme.palette.primary.main,
                    theme.palette.error.main,
                    theme.palette.warning.main,
                    theme.palette.info.main,
                    theme.palette.success.main,
                    theme.palette.secondary.main,
                ],
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.9,
                    stops: [200, 90, 100]
                }
            },
            colors: [
                theme.palette.primary.main,
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.info.main,
                theme.palette.success.main,
                theme.palette.secondary.main,
            ],
            tooltip: {
                theme: "dark",
                marker: {
                    show: false
                },
                onDatasetHover: {
                    highlightDataSeries: true,
                },
            },
            noData: {
                text: "No data",
                align: "center",
                verticalAlign: "middle",
                offsetX: 0,
                offsetY: 0,
                style: {
                    color: "#fff",
                    fontSize: "14px",
                    fontFamily: "Inter",
                    fontWeight: "bold"
                },
            },
            xaxis: {
                type: "datetime",
                labels: {
                    show: true,
                    rotate: -45,
                    rotateAlways: false,
                    hideOverlappingLabels: true,
                    formatter: function (value: any, timestamp: any) {
                        const date = new Date(timestamp);
                        // show day and month so: 29th June
                        return date.toLocaleDateString("en-US", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                        });
                    }
                },
                tooltip: {
                    enabled: false
                },
                crosshairs: {
                    show: false,
                },
                categories: new Array(30).fill(0).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return date.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                    });
                }).reverse(),
            },
            yaxis: {
                show: true,
                opposite: true,
                labels: {
                    offsetX: -5,
                    formatter: function (val: any) {
                        if (val === undefined) return 0;
                        
                        return val.toFixed(0);
                    }
                },
            },
            grid: {
                show: false,
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
        },
        series: memberList ? memberList.servers.map((server: any) => ({
            name: server.name,
            data: Array.from({ length: 30 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return server.members.filter((member: any) => {
                    const createdAt = new Date(member.createdAt);
                    return createdAt.getDate() === date.getDate() && createdAt.getMonth() === date.getMonth() && createdAt.getFullYear() === date.getFullYear();
                }).length;
            }).reverse()
        })) : [],
    };

    
    function renderGraph() {
        return (
            <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #18182e" }}>
                    <CardContent sx={{ pb: "1rem !important" }}>
                        {isLoading2 ? ( <CircularProgress /> ) : (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>Verified Members</Typography>
                                <Typography variant="body1" color="grey.200">Verified members over the past 30 days</Typography>


                                <ApexChart
                                    options={apexChart.options}
                                    series={apexChart.series}
                                    type="area"
                                    height={350}
                                />
                            </>
                        )}
                    </CardContent>
                </Paper>
            </Grid>
        )
    }

    function renderLastVerified() {
        return (
            <Grid item xs={12} md={6}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #18182e" }}>
                    <CardContent sx={{ pb: "1rem !important" }}>
                        {recentVerifiedLoading && ( <CircularProgress /> )}

                        {!recentVerifiedLoading && (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>Recent Activity</Typography>
                                <Typography variant="body1" color="grey.200">Last verified members</Typography>
                            </>
                        )}

                        {!recentVerifiedLoading && recentVerified.content.map((member: any) => { 
                            return (
                                <List key={member.id} sx={{ width: "100%", maxWidth: 360 }}>
                                    <ListItem key={member.id} sx={{ wordBreak: "break-all" }} disablePadding={true}>
                                        <ListItemAvatar>
                                            {member.avatar.length > 1 ? (
                                                <Avatar src={`https://cdn.discordapp.com/avatars/${member.userId}/${member.avatar}?size=128`} />
                                            ) : (
                                                <Avatar src={`https://cdn.discordapp.com/embed/avatars/${member.avatar}.png`} />
                                            )}
                                        </ListItemAvatar>
                                        <ListItemText primary={`${member.username.endsWith("#0") ? `@${member.username.slice(0, -2)}` : member.username}`} secondary={
                                            <>
                                                Id: {`${member.userId}`}<br/>
                                                Verified: {`${new Date(member.createdAt).toLocaleDateString()}`}
                                            </>
                                        } />
                                    </ListItem>
                                </List>
                            )
                        })}

                        {!recentVerifiedLoading && ( 
                            <Link href="/dashboard/members">
                                <Button variant="filled" color="white" sx={{ width: "100%" }}>
                                    View All
                                </Button>
                            </Link>
                        )}

                    </CardContent>
                </Paper>
            </Grid>
        )
    }


    function renderTopCountries() {
        // show a table like list of the top 10 countries with the most verified members
        return (
            <Grid item xs={12} md={6}>
                <Paper sx={{ borderRadius: "1rem", padding: "0.5rem", height: "100%", border: "1px solid #18182e" }}>
                    <CardContent sx={{ pb: "1rem !important" }}>
                        {topCountriesLoading && ( <CircularProgress /> )}

                        {!topCountriesLoading && (
                            <>
                                <Typography variant="h4" sx={{ mb: 2, fontWeight: "700" }}>Top Countries</Typography>
                                <Typography variant="body1" color="grey.200">Countries with the most verified members</Typography>
                            </>
                        )}

                        <Table>
                            {!topCountriesLoading && topCountries.content.map((country: any) => {
                                return (
                                    <TableRow key={country.country} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                        <TableCell>
                                            {/* look up country code from countries via name */}
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {countries.find((c: any) => c.name === country.country) && (
                                                    <Avatar alt="Country" src={`https://cdn.ipregistry.co/flags/twemoji/${countries.find((c: any) => c.name === country.country)?.code.toLowerCase()}.svg`} sx={{ width: 20, height: 20, borderRadius: 0 }} />
                                                )}
                                                <Typography variant="body1" color="grey.200">{country.country}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body1" color="grey.200">{country.count}</Typography>
                                        </TableCell>
                                    </TableRow>
                                )
                            }
                            )}
                        </Table>

                    </CardContent>
                </Paper>
            </Grid>
        )
    }

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar user={data}>
                    <Toolbar />

                    <Container maxWidth="xl">
                        {newsData.news.map((item: any) => {
                            if (window.localStorage.getItem("alerts")?.includes(item.id)) return null;

                            return (
                                <Alert key={item.id} id={item.id} severity={item.severity === 0 ? "info" : (item.severity === 1 ? "warning" : "error")} sx={{ width: "100%", my: 2 }} onClose={() => {
                                    try {
                                        const alerts = JSON.parse(window.localStorage.getItem("alerts") ?? "[]");
                                        alerts.push(item.id);
                                        window.localStorage.setItem("alerts", JSON.stringify(alerts));
                                        document.getElementById(item.id)?.remove();
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}>
                                    <AlertTitle>{item.title}</AlertTitle>
                                    <Typography variant="body2" component="p" sx={{ whiteSpace: "pre-line", wordBreak: "break-word" }} dangerouslySetInnerHTML={{ __html: item.content }}></Typography>
                                </Alert>
                            )
                        })}

                        {renderGraph()}

                        <Grid container spacing={3} sx={{ mt: 3 }}>
                            {renderLastVerified()}
                          
                            {renderTopCountries()}
                        </Grid>
                    </Container>
                </NavBar>
            </Box>
        </>
    )
}