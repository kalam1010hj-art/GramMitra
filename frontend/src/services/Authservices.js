import axios from "axios";

const URL = import.meta.env.VITE_API_URL

function login(formData){
    

    return axios.post(`${URL}accounts/login`,
        {
            username:formData.username,
            password:formData.password
        }
    )
}export default login;

export function register(formData){
    return axios.post(`${URL}accounts/register`,formData)
}




export const updateProfile = async (formData) => {
  const token = localStorage.getItem("token");

  const response = await axios.patch(
    `${URL}accounts/profileEditnp`,
    formData,
    {   
      headers: {
        ...(token && {
          Authorization: `Token ${token}`,
        }),
      },
    }
  );

  return response;
};