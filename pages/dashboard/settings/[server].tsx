import { useRouter } from "next/router";
import { useToken } from "../../../src/token";
import { useQuery } from "react-query";

import NavBar from "../../../components/dashboard/navBar";
import DashServerSettings from "../../../components/dashboard/ServerSettings";
import getUser from "../../../src/dashboard/getUser";

import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

export default function Settings() {
    const router = useRouter();
    const [ token ]: any = useToken()
    const { server } = router.query;

    const { data, isError, isLoading } = useQuery('user', async () => await getUser({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false, refetchOnWindowFocus: false });

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (isError) {
        return <div>Error</div>
    }

    if (!data.username) {
        router.push(`/login?redirect_to=${encodeURIComponent(router.pathname)}`);

        return <p>Loading...</p>
    }
    
    return (
        <>
            <Box sx={{ display: "flex" }}>
                <NavBar>
                    <Toolbar />
                    <DashServerSettings user={data} id={server} />
                </NavBar>
            </Box>
        </>
    )
}