import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react"

import NavBar from "../components/landing/NavBar"
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Link from "next/link";
import Head from "next/head";
import MuiLink from "@mui/material/Link";
import Footer from "../components/landing/Footer";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { LoadingButton } from "@mui/lab";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [openS, setOpenS] = useState(false);
    const [openE, setOpenE] = useState(false);
    const [notiTextS, setNotiTextS] = useState("X");
    const [notiTextE, setNotiTextE] = useState("X");

    const [token, setToken]: any = useState();
    const captchaRef: any = useRef();
    const router = useRouter();
    
    const [loadingBtn, setLoadingBtn] = useState(false);
    

    const onExpire = () => {
        setNotiTextE("Captcha expired");
        setOpenE(true);
        setLoadingBtn(false);
        // functions.ToastAlert("Captcha expired", "error");
    }

    const onError = (err: any) => {
        setNotiTextE(err);
        setOpenE(true);
        setLoadingBtn(false);
        // functions.ToastAlert(err, "error");
    }

    const onSubmit = (e: any) => {
        e.preventDefault();
        setLoadingBtn(true);
        captchaRef.current.execute();
    }

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        switch (name) {
        case "username":
            setUsername(value);
            break;
        case "email":
            setEmail(value);
            break;
        case "password":
            setPassword(value);
            break;
        default:
            break;
        }
    }

    useEffect(() => {
        try {
            if (token) {
                fetch(`/api/v2/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password,
                        captcha: token,
                        ref: router.query.r ? router.query.r : null
                    })
                })
                    .then(res => res.json())
                    .then(res => {
                        setLoadingBtn(false);
                        setToken(null);
                        if (res.success) {
                            setNotiTextS("Account created");
                            setOpenS(true);
                            // functions.ToastAlert("Account created", "success");
                            router.push("/login?username=" + encodeURIComponent(username));
                        } 
                        else {
                            setNotiTextE(res.message);
                            setOpenE(true);
                        // functions.ToastAlert(res.message, "error");
                        }
                    });
            }
        }
        catch (err) {
            console.error(err);
        }
    }, [email, password, router, token, username]);

    return (
        <>
            <Box sx={{ minHeight: "100vh", flexDirection: "column", display: "flex", pt: "2.5rem", background: "rgba(0, 0, 0, 0.75)" }}>
                <Head>
                    <meta name="description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and much more" />
                    <meta property="og:description" content="RestoreCord is a Recovery Service, it can Backup and Restore your Servers Members, Channels, Categories, Roles and do much more" />
                    <meta property="og:title" content="RestoreCord - Register" />
                </Head>

                <Container maxWidth="lg" sx={{ mx: "auto", justifyContent: "center", alignItems: "center" }}>

                    <NavBar />

                    <Snackbar open={openE} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenE(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                        <Alert elevation={6} variant="filled" severity="error">
                            {notiTextE}
                        </Alert>
                    </Snackbar>

                    <Snackbar open={openS} autoHideDuration={3000} onClose={(event?: React.SyntheticEvent | Event, reason?: string) => { if (reason === "clickaway") { return; } setOpenS(false); }} anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                        <Alert elevation={6} variant="filled" severity="success">
                            {notiTextS}
                        </Alert>
                    </Snackbar>

                    <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: "3rem" }}>
                        <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: "bold" }} gutterBottom>
                            Register an Account
                        </Typography>

                        <form onSubmit={onSubmit}>
                            <Box sx={{ width: "100%", maxWidth: "500px", mx: "auto", mt: "3rem" }}>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                    InputProps={{ inputProps: { minLength: 3, maxLength: 20 } }}
                                    autoFocus
                                    value={username}
                                    onChange={handleChange}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    InputProps={{ inputProps: { minLength: 6, maxLength: 50 } }}
                                    value={email}
                                    onChange={handleChange}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    InputProps={{ inputProps: { minLength: 6, maxLength: 45 } }}
                                    autoComplete="password"
                                    value={password}
                                    onChange={handleChange}
                                />
                                <HCaptcha
                                    sitekey="748ea2c2-9a8d-4791-b951-af4c52dc1f0f"
                                    size="invisible"
                                    theme="dark"
                                    onVerify={setToken}
                                    onError={onError}
                                    onExpire={onExpire}
                                    ref={captchaRef}
                                />
                                <LoadingButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: "1rem", mb: "0.5rem" }}
                                    loading={loadingBtn}
                                >
                                    Register
                                </LoadingButton>
                                <Grid container>
                                    <Grid item xs>
                                        <Typography variant="body2" gutterBottom>
                                            You agree to our{" "}
                                            <Link href="/terms">
                                                <MuiLink variant="body2" component="a" href="/terms">Terms of Service</MuiLink>
                                            </Link>
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Link href="/login">
                                            <MuiLink variant="body2" component="a" href="/login">
                                                Already have an account? Sign In
                                            </MuiLink>
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Box>
                        </form>
                    </Box>
                </Container>

                <Footer />
            </Box>

            {/* <div>
                <div>
                    <div>
                        <h1>Register an Account</h1>
                    </div>
                    <form onSubmit={onSubmit}>
                        <div>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">Username</label>
                                <div className="relative mb-6">
                                    <input name="username" onChange={handleChange} type="text" id="username" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="User" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                                <div className="relative mb-6">
                                    <input name="email" onChange={handleChange} type="email" id="email" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="johndoe@gmail.com" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
                                <div className="relative">
                                    <input name="password" onChange={handleChange} type="password" id="password" className="transition-all border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••••" />
                                </div>
                            </div>

                            <div>
                                <HCaptcha
                                    sitekey="748ea2c2-9a8d-4791-b951-af4c52dc1f0f"
                                    size="invisible"
                                    onVerify={setToken}
                                    onError={onError}
                                    onExpire={onExpire}
                                    ref={captchaRef}
                                />
                            </div>
                            
                            <div>
                                <a>
                                    Already have an account? <Link href="/login"><span>Login</span></Link>.
                                    <br/>
                                    By clicking Register, you agree to our <Link href="/terms"><span>Terms</span></Link> and <Link href="/privacy"><span>Privacy Policy</span></Link>.
                                </a>
                            </div>
                        </div>

                        <div>
                            <button type="submit">
                                Register
                            </button>
                        </div>  
                    </form>
                </div>
            </div> */}
        </>
    )
}
