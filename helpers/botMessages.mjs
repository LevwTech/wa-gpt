const MESSAGES = {
    START: {
        en: "Hey, what can you do?",
        es: "Hola, ¿qué puedes hacer?",
        ar: "مرحبًا، ما الذي يمكنك فعله؟",
    },
    START_REPLY: {
        "en": "I'm your WhatsApp AI Assistant! I'm here to assist you with any questions you have and help with generating images and stickers. Simply use the /image and /sticker commands followed by a description, and I'll take care of the rest! Feel free to ask me anything using text or voice notes 🤖✨ Additionally, you can upload files, and I'll summarize them for you. Feel free to ask any questions about these files!",
        "es": "¡Soy tu asistente de inteligencia artificial de WhatsApp! Estoy aquí para ayudarte con cualquier pregunta que tengas y ayudarte a generar imágenes y pegatinas. ¡Simplemente usa los comandos /imagen y /pegatina seguidos de una descripción, y yo me encargaré del resto! Siéntete libre de preguntarme cualquier cosa usando texto o notas de voz 🤖✨ Además, puedes subir archivos y yo los resumiré para ti. ¡No dudes en hacer cualquier pregunta sobre estos archivos!",
        "ar": "أنا مساعدك الذكي على واتساب! أنا هنا لمساعدتك في الإجابة على أي أسئلة تتعلق بإنشاء الصور والملصقات. ما عليك سوى استخدام أوامر /image و /sticker تليها وصف، وسأقوم بالباقي! لا تتردد في طرح أي سؤال باستخدام النص أو الرائل الصوتية 🤖✨ بالإضافة إلى ذلك، يمكنك تحميل الملفات، وسألخصها لك. لا تتردد في طرح أي أسئلة حول هذه الملفات!"
    },
    SUBSCRIBED: {
        en: "Thank you for subscribing! ✨ I'm here to help you navigate through questions and create images and stickers for you. To kick things off, just type /image or /sticker followed by a description, and I'll work my magic. Let's get started! 🚀🤖",
        es: "¡Gracias por suscribirte! ✨ Estoy aquí para ayudarte a navegar por las preguntas y crear imágenes y pegatinas para ti. Para comenzar, simplemente escribe /imagen o /pegatina seguido de una descripción, y yo haré mi magia. ¡Comencemos! 🚀🤖",
        ar: "شكرًا لك على الاشتراك! أنا هنا لمساعدتك في التنقل عبر الأسئلة وإنشاء الصور والملصقات لك. لبدء الأمور، ما عليك سوى كتابة /image أو /sticker تليها وصف، وسأقوم بسحري. لنبدأ! 🚀🤖",
    },
    UPGRADED_SUBSCRIPTION: {
        en: "Congratulations on upgrading your subscription! 🎉 Get ready to enjoy even more image and sticker generation features. I'm here to enhance your experience and assist you in creating captivating visuals. Feel free to explore new possibilities by typing /image or /sticker followed by a description. Let's elevate your creativity to new heights! 🚀✨",
        es: "¡Felicidades por actualizar tu suscripción! 🎉 Prepárate para disfrutar de aún más características de generación de imágenes y pegatinas. Estoy aquí para mejorar tu experiencia y ayudarte a crear visuales cautivadores. Siéntete libre de explorar nuevas posibilidades escribiendo /imagen o /pegatina seguido de una descripción. ¡Elevemos tu creatividad a nuevas alturas! 🚀✨",
        ar: " تهانينا على ترقية اشتراكك! 🎉 استعد للاستمتاع بميزات إنشاء الصور والملصقات المزيدة. أنا هنا لتعزيز تجربتك ومساعدتك في إنشاء رؤى جذابة. لا تتردد في استكشاف احتمالات جديدة عن طريق كتابة /image أو /sticker تليها وصف. دعنا نرفع إبداعك إلى مستويات جديدة! 🚀✨",
    },
    STICKER_WAIT: {
        en: "Hold tight! your awesome sticker is being generated ⏳",
        es: "¡Espera un momento! tu increíble pegatina se está generando ⏳",
        ar: "يتم إنشاء ملصقك الرائع ⏳"
    },
    IMAGE_WAIT: {
        en: "Hold tight! I'm generating your image ⏳🖼️",
        es: "¡Espera un momento! Estoy generando tu imagen ⏳🖼️",
        ar: "أقوم بإنشاء صورتك ⏳🖼️"
    },
    RATE_LIMIT: {
        en: "I'm sorry, I'm currently experiencing a high volume of requests. Please try again later. 🙏",
        es: "Lo siento, actualmente estoy experimentando un alto volumen de solicitudes. Por favor, inténtalo de nuevo más tarde. 🙏",
        ar: "آسف، أواجه حاليا كمية كبيرة من الطلبات. يرجى المحاولة مرة أخرى لاحقًا. 🙏",
    },
    IMAGE_WITHOUT_TEXT: {
        en: "Oops! You didn't provide any text for your image. Please use the /image command followed by the text you want on the image.",
        es: "¡Ops! No proporcionaste ningún texto para tu imagen. Por favor, usa el comando /imagen seguido del texto que quieres en la imagen.",
        ar: "عفوًا! لم تقدم أي نص لصورتك. يرجى استخدام أمر /image متبوعًا بالنص الذي تريده في الصورة."
        },
    STICKER_WITHOUT_TEXT: {
        en: "Oops! You didn't provide any text for your sticker. Please use the /sticker command followed by the text you want on the sticker.",
        es: "¡Ops! No proporcionaste ningún texto para tu sticker. Por favor, usa el comando /sticker seguido del texto que quieres en el sticker.",
        ar: "عفوًا! لم تقدم أي نص لملصقك. يرجى استخدام أمر /sticker متبوعًا بالنص الذي تريده في الملصق."
    },
    UNLIMITED_PLAN_RATE_LIMIT: {
        en: "You've been generating a lot of stickers and images lately. Please try again in a few hours. 🕒🙏",
        es: "Has estado generando muchas pegatinas e imágenes últimamente. Por favor, inténtalo de nuevo en unas horas. 🕒🙏",
        ar: "لقد قمت بإنشاء العديد من الملصقات والصور مؤخرًا. يرجى المحاولة مرة أخرى في غضون بضع ساعات. 🕒🙏",
    },
    COULDNT_RENEW: {
        en: "I couldn't renew your subscription. Don't worry! You can still enjoy the features by resubscribing.", 
        es: "No pude renovar tu suscripción. ¡No te preocupes! Todavía puedes disfrutar de las características volviendo a suscribirte.",
        ar: "لم أتمكن من تجديد اشتراكك. لا تقلق! يمكنك ما زلت الاستمتاع بالميزات عن طريق الاشتراك مرة أخرى.",
    },
    FREE_TRIAL_ENDED: {
        en: "Your free trial of WhatsApp AI Assistant has ended. Keep creating stickers 🎨, generating images 🖼️, and getting answers instantly by subscribing now!",
        es: "Tu prueba gratuita del Asistente de IA de WhatsApp ha terminado. ¡Sigue creando pegatinas 🎨, generando imágenes 🖼️ y obteniendo respuestas al instante suscribiéndote ahora!",
        ar: "انتهت فترة الاختبار المجاني لمساعد واتساب للذكاء الصناعي. استمر في إنشاء الملصقات 🎨، وتوليد الصور 🖼️، والحصول على الإجابات على الفور عن طريق الاشتراك الآن!",
    },
    TOKENS_EXCEEDED: {
        en: "You've used up all your sticker and image generations 🚀 To keep the creativity flowing, why not consider upgrading to a higher tier?",
        es: "Has utilizado todas tus generaciones de pegatinas e imágenes 🚀 Para mantener la creatividad fluyendo, ¿por qué no consideras la posibilidad de actualizar a un nivel superior?",
        ar: "لقد استخدمت جميع ملصقاتك وتوليدات صورك 🚀 للحفاظ على تدفق الإبداع، لماذا لا تفكر في الترقية إلى طبقة أعلى؟",
    },
    ENJOY_FOOTER_1: {
        en: "Don't miss out on the full experience! ✨",
        es: "¡No te pierdas la experiencia completa! ✨",
        ar: "لا تفوت الفرصة للحصول على تجربة كاملة! ✨",
    },
    ENJOY_FOOTER_2: {
        en: "Explore and enjoy the full experience! ✨",
        es: "¡Explora y disfruta de la experiencia completa! ✨",
        ar: "استكشف واستمتع بالتجربة الكاملة! ✨",
    },
    SUBSCRIBE_BTN: {
        en: "Subscribe Now",
        es: "Suscríbete Ahora",
        ar: "اشترك الآن",
    },
    RENEW_BTN: {
        en: "Renew Subscription",
        es: "Renovar suscripción",
        ar: "تجديد الاشتراك",
    },
    UPGRADE_BTN: {
        en: "Upgrade Subscription",
        es: "Actualizar",
        ar: "الترقية",
    }
}
export default MESSAGES
