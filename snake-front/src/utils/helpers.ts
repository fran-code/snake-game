import { constants } from './constants';
import { ITokenAuthData } from './interfaces';
import { message } from "antd";
import { apiUrl } from '../env';

//Hace una llamda con axios con los parámetros facilitados
export const apiCall = async (
    endpoint: string,
    {
        data, headers: customHeaders, ...customConfig
    }: any = {}
) => {
    return window.fetch(`${apiUrl}/${endpoint}`, {
        method: data ? 'POST' : 'GET',
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': data ? 'application/json' : undefined,
            ...customHeaders,
        },
        ...customConfig,
    }).then(async response => {
        if (response.status === 401) {
            await logOut()
            return Promise.reject({ message: 'Please re-authenticate.' })
        }
        const data = await response.json()
        if (response.ok) {
            return data
        } else {
            message.error(data.message)
            return Promise.reject(data)
        }
    })
}

const tokenAuth = window.localStorage.getItem(constants.authToken)

export const getDataTokenAuth = (): ITokenAuthData | null => {
    if (!tokenAuth) return null;
    if (Date.now() / 1000 > JSON.parse(decodeURIComponent(escape(window.atob(tokenAuth!.split('.')[1])))).exp) {
        logOut()
        return null
    }
    const dataTokenAuth: ITokenAuthData = tokenAuth !== undefined &&tokenAuth !== null ?
        JSON.parse(decodeURIComponent(escape(window.atob(tokenAuth!.split('.')[1]))))
        : null;
    return dataTokenAuth;
}

export const isLogged = () => {
    const tokenLocalStorage = tokenAuth;
    return tokenLocalStorage !== null
}

export const logOut = () => {
    apiCall(constants.endpoints.logout, { method: 'POST' }).then(
        ok => {
            window.localStorage.removeItem(constants.authToken)
            window.location.assign(window.location.href)
        }
    )

}