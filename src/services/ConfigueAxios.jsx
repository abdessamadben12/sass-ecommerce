import axios from "axios"

export  const axiosConfig= axios.create(
    {
        baseURL:"http://localhost:8000/api",
       
        headers: {
            'Authorization': 'Bearer VOTRE_TOKEN_ICI',
            'Accept': 'application/json',
            withCredentials:"true",

          }
    }
)
export const getCsrfTocken=async()=>await axios.get("http://localhost:8000/sanctum/csrf-cookie").then(res=>res.data)

