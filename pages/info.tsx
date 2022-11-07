import { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import NavBar from "../components/landing/NavBar";
import theme from "../src/theme";
import axios from "axios";

import StorageIcon from "@mui/icons-material/Storage";
import PersonIcon from "@mui/icons-material/Person";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import CodeIcon from "@mui/icons-material/Code";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SaveIcon from "@mui/icons-material/Save";
import PeopleIcon from "@mui/icons-material/People";

async function getStats() {
    return await axios.get(`/api/v1/stats?details=true`, {
        validateStatus: () => true
    })
        .then((res: any) => { return res.data; })
        .catch((err: any) => { return err; });    
}

export default function Info() {
   
    useEffect(() => {
        const interval = setInterval(() => {
            getStats().then((stats: any) => {
                setStats(stats);
            });
        }, 1000);

        return () => clearInterval(interval);
    });

    const [stats, setStats]: any = useState({
        accounts: 0,
        servers: 0,
        members: 0,
        bots: 0,
        totalMembers: 0,
        subscribers: 0
    });


    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem" }}>
                <Container maxWidth="xl" sx={{ mx: "auto", justifyContent: "center", alignItems: "center"}}>
                    <NavBar />

                    <Grid container spacing={4}>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <ContactPageIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    <Typography variant="h5">{stats.accounts.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Accounts
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <StorageIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    <Typography variant="h5">{stats.servers.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Servers
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <PersonIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    <Typography variant="h5">{stats.members.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Members
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <CodeIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    <Typography variant="h5">{stats.bots.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Custom Bots
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <SaveIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    <Typography variant="h5">{stats.backups.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Backups
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                        <Grid item xs={6} sm={5} md={3}>
                            <Paper elevation={3}>
                                <CardContent sx={{ alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                                    <PeopleIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />
                                    <Typography variant="h5">{stats.totalMembers.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Typography>
                                    <Typography variant="body2" component="p" color="textSecondary">
                                        Total Members
                                    </Typography>
                                </CardContent>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}