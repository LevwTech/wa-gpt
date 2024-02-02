import { BOT_PHONE_NUMBER, WHATSAPP_URL} from "./helpers/constants.mjs"
export const getWhatsAppInfo = (payload) => {
    // TODO validate auth 
    return {
        phone: BOT_PHONE_NUMBER,
        whatsAppUrl: WHATSAPP_URL
    }
}