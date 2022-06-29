import { useState } from "react"
import { useQuery } from "react-query";
import getNews from "../../src/dashboard/getNews";
import functions from "../../src/functions";
import { useToken } from "../../src/token"



export default function DashBoard({ user }: any) {
    const [token]: any = useToken();

    const { data, isError, isLoading } = useQuery('news', async () => await getNews({
        Authorization: (process.browser && window.localStorage.getItem("token")) ?? token, 
    }), { retry: false,  refetchOnWindowFocus: false });

    if (isError) {
        functions.ToastAlert("Something went wrong.", "error")
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }


    if (!user || isLoading) {
        return (
            <>
                <span className="text-white">Loading...</span>
            </>
        )
    }

    return (
        <>
            <div className="lg:mx-48 lg:mt-16 md:mt-8 md:mx-24 w-full">
                <div className="col-span-12 md:col-span-8 mb-4">
                    <h1 className="text-white text-4xl font-bold leading-tight">
                            Dashboard
                    </h1>
                    <p className="text-gray-500 text-base leading-tight">
                            Latest news, updates, and statistics.
                    </p>
                </div>
                <div className="max-w-screen p-4 w-full rounded-lg border shadow-md bg-gray-900 border-gray-800">
                    <h2 className="text-white text-3xl font-bold leading-tight mb-4">
                                    Updates
                    </h2>
                    {Array.isArray(data.news) && data.news.map((item: any) => {
                        return (
                            <>
                                <div key={item.id}>
                                    <div className="mb-6 p-6 max-w-7xl rounded-lg border shadow-md bg-gray-800 border-gray-700">
                                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">{item.title}</h5>
                                        <p className="mb-3 font-normal text-gray-400 whitespace-pre-line">{item.content}</p>
                                        <hr className="border-b border-gray-700" />
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center">
                                                <svg className="h-6 w-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <span className="ml-2 text-sm text-gray-500">{new Date(item.createdAt).toUTCString()}</span>
                                                <span style={{borderRight: "2px solid #374151", color: "transparent"}}>x</span>
                                                <span className="ml-2 text-sm text-gray-500">{item.author}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    })}
                </div>
            </div>
        </>
    )
}