// Contenido del sitio. Los textos entre [corchetes] son datos pendientes de confirmar con la clínica o la Dra.

export const site = {
  name: 'Alaria Medicina Estética',
  tagline: 'Primero valoración, después decisión.',
  description:
    'Medicina estética con criterio médico en Guatemala. La Dra. Katherine González V. evalúa tu caso y define contigo el tratamiento adecuado. Reserva tu cita.',
  whatsapp: '50236038581',
  whatsappMessage: 'Hola, quisiera información sobre una valoración en Alaria Medicina Estética.',
  doctor: {
    name: 'Dra. Katherine González V.',
    title: 'Médica con enfoque en medicina estética',
    bioShort:
      'Atiende cada caso con criterio médico: evalúa primero, propone después y acompaña el seguimiento. [pendiente: años de experiencia]',
    bioLong: [
      'La Dra. Katherine González V. atiende en Alaria Medicina Estética.',
      'Cada consulta empieza con tu historial, tus objetivos y una revisión de contraindicaciones. Solo después se decide si un tratamiento tiene sentido en tu caso.',
      '[dato médico pendiente: trayectoria clínica y áreas de especial interés]',
    ],
    credentials: [
      '[dato médico pendiente: título de médica, universidad y año de graduación]',
      '[dato médico pendiente: número de colegiado]',
      '[dato médico pendiente: certificaciones en medicina estética]',
      '[dato médico pendiente: formación en procedimientos específicos]',
    ],
  },
};

/** `short` es la etiqueta de la barra inferior móvil. */
export const nav = [
  { label: 'Inicio', short: 'Inicio', href: '/' },
  { label: 'Tratamientos', short: 'Tratamientos', href: '/tratamientos/' },
  { label: 'Resultados', short: 'Resultados', href: '/resultados/' },
  { label: 'Visítanos', short: 'Visítanos', href: '/visitanos/' },
  { label: 'Reservar valoración', short: 'Reservar', href: '/agendar/' },
];

export const home = {
  eyebrow: 'Alaria Medicina Estética · Guatemala',
  h1: 'Medicina estética con criterio médico en Guatemala',
  lead: 'La Dra. Katherine González V. evalúa tu caso y define contigo qué tratamiento tiene sentido. Empiezas con una valoración, no con un procedimiento.',
  ctaPrimary: 'Reservar mi valoración',
  ctaSecondary: 'Escribir por WhatsApp',
  ctaTertiary: 'Ver tratamientos',
  approach: {
    title: 'Cómo trabajamos',
    intro: 'Cada consulta sigue el mismo orden. Así sabes qué esperar antes de decidir nada.',
    pillars: [
      {
        title: 'Valoración primero',
        text: 'Revisamos tu historial, tus objetivos y tus contraindicaciones antes de hablar de productos o procedimientos.',
      },
      {
        title: 'Un plan claro',
        text: 'Te explicamos qué tratamiento podría tener sentido en tu caso, por qué, y qué resultados son realistas.',
      },
      {
        title: 'Seguimiento médico',
        text: 'Revisamos tu evolución después del tratamiento y ajustamos el plan si hace falta.',
      },
    ],
  },
  doctorTeaser: {
    title: 'Dra. Katherine González V.',
    text: 'Evaluamos primero y proponemos después. Conoce su formación y su forma de trabajar. [dato médico pendiente: años de experiencia]',
    cta: 'Leer más sobre la doctora',
  },
  treatmentsTeaser: {
    title: 'Tratamientos',
    intro: 'Cinco líneas de trabajo. Todas empiezan con la misma valoración.',
  },
  faqTeaser: {
    title: 'Preguntas frecuentes',
  },
};

export type Treatment = {
  slug: string;
  number: string;
  name: string;
  short: string;
  metaDescription: string;
  intro: string;
  forWho: string[];
  whatToExpect: { step: string; text: string }[];
  facts: { label: string; value: string }[];
  faq: { q: string; a: string }[];
  beforeDeciding: string[];
};

const beforeDeciding = [
  'Requiere valoración médica previa.',
  'Las contraindicaciones se confirman en tu consulta.',
  'Los resultados varían según cada persona.',
];

// El encabezado "Antes de decidir" lo pone la plantilla.
export const treatments: Treatment[] = [
  {
    slug: 'armonizacion-facial',
    number: '01',
    name: 'Armonización facial',
    short: 'Evaluamos proporciones del rostro y definimos qué zonas tienen sentido trabajar.',
    metaDescription:
      'Armonización facial en Guatemala con valoración médica previa. Conoce para quién es, qué esperar y qué confirmar antes de decidir contigo.',
    intro:
      'La armonización facial busca un rostro más equilibrado según tus rasgos. Primero revisamos tus proporciones y tus objetivos; el plan se define después.',
    forWho: [
      'Quienes quieren mejorar el equilibrio general del rostro.',
      'Quienes buscan un resultado natural y gradual.',
      'Quienes desean una opinión médica antes de decidir.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos tu historial, tus objetivos y tus contraindicaciones.' },
      { step: 'Plan', text: 'Te explicamos qué zonas podrían tratarse, con qué técnica y qué resultado es realista.' },
      {
        step: 'Procedimiento',
        text: 'Se realiza en consultorio con los productos que confirmamos contigo. [dato médico pendiente: técnica y productos utilizados]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos tu evolución y ajustamos el plan si hace falta. [dato médico pendiente: citas de control]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones]' },
      { label: 'Recuperación', value: '[dato médico pendiente: tiempo de recuperación y cuidados posteriores]' },
    ],
    faq: [
      {
        q: '¿Cuánto dura el procedimiento?',
        a: 'Depende del plan que definamos en tu valoración. [dato médico pendiente: duración estimada]',
      },
      {
        q: '¿Duele?',
        a: 'La sensibilidad varía según la zona y la persona. Te explicamos las opciones para tu comodidad durante la valoración. [dato médico pendiente: manejo de molestias]',
      },
      {
        q: '¿Se notará?',
        a: 'El objetivo es un resultado natural, pero cada rostro es distinto. Lo revisamos contigo en la valoración.',
      },
    ],
    beforeDeciding,
  },
  {
    slug: 'toxina-botulinica',
    number: '02',
    name: 'Toxina botulínica',
    short: 'Trabajamos líneas de expresión solo si tu valoración lo indica.',
    metaDescription:
      'Toxina botulínica en Guatemala con valoración médica previa. Conoce para quién es, cómo se planifica y qué confirmar antes de decidir.',
    intro:
      'La toxina botulínica se usa en líneas de expresión dinámicas. Antes de proponerla, evaluamos si es la opción adecuada para ti.',
    forWho: [
      'Quienes notan líneas de expresión en frente, entrecejo o contorno de ojos.',
      'Quienes buscan una expresión natural y un plan gradual.',
      'Quienes quieren entender sus alternativas antes de empezar.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos tus gestos, tu historial y tus contraindicaciones.' },
      { step: 'Plan', text: 'Te explicamos las zonas posibles, las dosis orientativas y el resultado esperado.' },
      {
        step: 'Procedimiento',
        text: 'Se aplica en consultorio, con productos confirmados contigo. [dato médico pendiente: técnica y producto utilizado]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos el resultado y ajustamos si hace falta. [dato médico pendiente: fecha de control]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones y frecuencia]' },
      { label: 'Recuperación', value: '[dato médico pendiente: tiempo para ver el efecto y cuidados posteriores]' },
    ],
    faq: [
      {
        q: '¿Cuánto tarda en notarse el efecto?',
        a: 'Varía según la zona y la persona. [dato médico pendiente: tiempo estimado de efecto]',
      },
      {
        q: '¿Duele?',
        a: 'Algunas personas sienten molestias leves durante la aplicación. Te explicamos cómo se maneja en tu valoración. [dato médico pendiente: manejo de molestias]',
      },
      {
        q: '¿Se pierde el efecto?',
        a: 'El efecto no es permanente. Te explicamos la frecuencia recomendada según tu plan. [dato médico pendiente: duración del efecto]',
      },
    ],
    beforeDeciding,
  },
  {
    slug: 'bioestimuladores',
    number: '03',
    name: 'Bioestimuladores de colágeno',
    short: 'Pueden apoyar la producción de colágeno de forma gradual.',
    metaDescription:
      'Bioestimuladores de colágeno en Guatemala con valoración médica previa. Conoce para quién son, qué esperar y qué confirmar antes de decidir.',
    intro:
      'Los bioestimuladores se usan para apoyar la firmeza de la piel de forma gradual. El producto y el número de sesiones dependen de tu valoración.',
    forWho: [
      'Quienes notan pérdida de firmeza o volumen en el rostro.',
      'Quienes prefieren un resultado gradual.',
      'Quienes buscan un plan a mediano plazo.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos tu piel, tu historial y tus contraindicaciones.' },
      { step: 'Plan', text: 'Te explicamos el producto recomendado, las zonas y el calendario orientativo.' },
      {
        step: 'Procedimiento',
        text: 'Se aplica en consultorio con el producto confirmado. [dato médico pendiente: producto y técnica utilizados]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos tu evolución entre sesiones. [dato médico pendiente: intervalo entre sesiones]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones]' },
      { label: 'Recuperación', value: '[dato médico pendiente: molestias esperables y cuidados posteriores]' },
    ],
    faq: [
      {
        q: '¿Cuándo se notan los resultados?',
        a: 'El efecto es gradual y varía según la persona. [dato médico pendiente: tiempo estimado de resultados]',
      },
      {
        q: '¿Qué productos se usan?',
        a: 'Te informamos qué producto se usará antes de cualquier procedimiento. [dato médico pendiente: productos y registros sanitarios]',
      },
      {
        q: '¿Hay que repetirlo?',
        a: 'Depende del plan. Lo definimos en tu valoración. [dato médico pendiente: frecuencia de mantenimiento]',
      },
    ],
    beforeDeciding,
  },
  {
    slug: 'calidad-de-piel',
    number: '04',
    name: 'Calidad de piel',
    short: 'Tratamientos para textura, hidratación y luminosidad, según tu tipo de piel.',
    metaDescription:
      'Tratamientos para calidad de piel en Guatemala con valoración médica previa. Conoce las opciones según tu tipo de piel antes de decidir.',
    intro:
      'Trabajamos la textura, la hidratación y el aspecto general de la piel. Primero identificamos tu tipo de piel y tus necesidades.',
    forWho: [
      'Quienes notan piel opaca, deshidratada o con textura irregular.',
      'Quienes tienen manchas o cicatrices leves que quieren evaluar.',
      'Quienes buscan un plan de cuidado con criterio médico.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos tu tipo de piel, tu historial y tus contraindicaciones.' },
      { step: 'Plan', text: 'Te explicamos el tratamiento recomendado y los cuidados en casa.' },
      {
        step: 'Procedimiento',
        text: 'Se realiza en consultorio con los productos confirmados contigo. [dato médico pendiente: técnica y productos utilizados]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos tu piel y ajustamos el plan. [dato médico pendiente: sesiones de control]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones]' },
      {
        label: 'Recuperación',
        value: '[dato médico pendiente: enrojecimiento o descamación esperables y cuidados posteriores]',
      },
    ],
    faq: [
      {
        q: '¿Cuánto tarda la recuperación?',
        a: 'Depende del tratamiento y de tu piel. [dato médico pendiente: tiempo de recuperación por tratamiento]',
      },
      {
        q: '¿Sirve para cualquier tipo de piel?',
        a: 'No necesariamente. Por eso empezamos con una valoración de tu piel. [dato médico pendiente: tipos de piel no indicados]',
      },
      {
        q: '¿Qué cuidados debo tener después?',
        a: 'Te damos instrucciones por escrito en cada sesión. [dato médico pendiente: protocolo de cuidados posteriores]',
      },
    ],
    beforeDeciding,
  },
  {
    slug: 'contorno-corporal',
    number: '05',
    name: 'Contorno corporal',
    short: 'Opciones para zonas localizadas, evaluadas caso por caso.',
    metaDescription:
      'Contorno corporal en Guatemala con valoración médica previa. Conoce las opciones para zonas localizadas y qué confirmar antes de decidir.',
    intro:
      'Ofrecemos opciones para zonas localizadas. No son un método para bajar de peso, y cada caso se evalúa de forma individual.',
    forWho: [
      'Quienes tienen zonas localizadas que no responden a dieta o ejercicio.',
      'Quienes buscan una opinión médica antes de elegir un método.',
      'Quienes tienen expectativas realistas sobre el resultado.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos la zona, tu historial y tus contraindicaciones.' },
      {
        step: 'Plan',
        text: 'Te explicamos las opciones, el número de sesiones orientativo y el resultado realista.',
      },
      {
        step: 'Procedimiento',
        text: 'Se realiza en consultorio con el equipo o producto confirmado. [dato médico pendiente: técnica y equipo utilizados]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos tu evolución y los cuidados posteriores. [dato médico pendiente: citas de control]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones]' },
      { label: 'Recuperación', value: '[dato médico pendiente: molestias esperables y tiempo de recuperación]' },
    ],
    faq: [
      {
        q: '¿Sirve para bajar de peso?',
        a: 'No. Son opciones para zonas localizadas. Te explicamos sus límites en la valoración.',
      },
      {
        q: '¿Cuántas sesiones necesito?',
        a: 'Depende de la zona y del plan. [dato médico pendiente: número de sesiones orientativo]',
      },
      { q: '¿Duele?', a: 'Depende de la técnica y de la persona. [dato médico pendiente: manejo de molestias]' },
    ],
    beforeDeciding,
  },
];

export const faq = [
  {
    q: '¿Qué pasa en la primera cita?',
    a: 'Empiezas con una valoración: revisamos tu historial, tus objetivos y tus contraindicaciones. Si conviene un tratamiento, te lo explicamos con sus alternativas. No tienes que decidir ese día.',
  },
  {
    q: '¿Duele? ¿Cuánto tarda la recuperación?',
    a: 'Varía según el tratamiento y la persona. Te explicamos las molestias esperables y los cuidados antes de cualquier procedimiento. [dato médico pendiente: molestias y recuperación por tratamiento]',
  },
  {
    q: '¿Va a quedar natural?',
    a: 'El objetivo es un resultado armónico y acorde con tus rasgos. Los resultados varían en cada persona, por eso se definen en la valoración.',
  },
  {
    q: '¿Qué productos utilizan?',
    a: 'Te informamos qué producto se usará antes de cualquier procedimiento. [pendiente: confirmar productos y registros sanitarios]',
  },
  {
    q: '¿Cómo reservo mi valoración?',
    a: 'Llena el formulario de reserva o escríbenos por WhatsApp. Te confirmamos fecha y hora. [pendiente: tiempo de respuesta]',
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'El costo depende del plan que definamos en tu valoración. [pendiente: política de precios y formas de pago]',
  },
];

export const results = {
  title: 'Resultados',
  intro:
    'Mostramos casos solo con autorización escrita de cada paciente. Cada caso es distinto, y los resultados varían.',
  beforeAfter: {
    title: 'Antes y después',
    emptyState: 'Pronto compartiremos casos con autorización de cada paciente.',
    consentNote:
      'Solo publicamos fotografías con consentimiento escrito. Puedes pedir que retiremos la tuya en cualquier momento.',
  },
  testimonials: {
    title: 'Opiniones de pacientes',
    emptyState: 'Pronto compartiremos opiniones de pacientes que nos autoricen.',
    googleCta: 'Ver reseñas en Google [pendiente: enlace al perfil de Google Business]',
  },
};

export const visit = {
  title: 'Visítanos',
  intro: 'Te esperamos con cita previa. Confirma tu horario antes de llegar.',
  address: '[pendiente: dirección completa del consultorio]',
  mapsQuery: '[pendiente: dirección para el enlace de Google Maps]',
  hours: [
    { day: 'Lunes a viernes', time: '[pendiente: horario]' },
    { day: 'Sábado', time: '[pendiente: horario]' },
  ],
  contactNote: 'Para cambios de cita, escríbenos por WhatsApp. [pendiente: teléfono fijo y correo]',
};

export const booking = {
  title: 'Reserva tu valoración',
  intro:
    'Llena el formulario y te confirmamos la cita. Solo pedimos los datos necesarios para preparar tu consulta.',
  // Clave pública de Web3Forms: identifica el formulario, no es un secreto.
  web3formsKey: 'd59195be-15a6-4e3c-af03-01120f9995df',
  endpoint: 'https://api.web3forms.com/submit',
  form: {
    name: 'Nombre completo',
    phone: 'Teléfono o WhatsApp',
    email: 'Correo electrónico (opcional)',
    treatment: 'Tratamiento de interés (opcional)',
    message: 'Cuéntanos qué te preocupa (opcional)',
    submit: 'Reservar mi valoración',
    sending: 'Enviando tu solicitud…',
    success: 'Recibimos tu solicitud. Te escribiremos para confirmar fecha y hora.',
    error:
      'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.',
    offline:
      'Sin conexión. Tu solicitud no se envió. Intenta de nuevo cuando vuelvas a estar en línea o escríbenos por WhatsApp.',
    privacy: 'Usamos tus datos para agendar tu valoración. [pendiente: texto legal del aviso de privacidad]',
  },
  validation: {
    required: 'Este campo es obligatorio.',
    email: 'Escribe un correo válido, por ejemplo nombre@correo.com.',
    phone: 'Escribe un número de 8 dígitos, por ejemplo 5555 5555.',
  },
  whatsappAlt: '¿Prefieres hablar primero? Escríbenos por WhatsApp.',
  // Calendario de Cal.com: `usuario/evento` o la URL pública del evento. Vacío = se muestra el formulario.
  // Horario, zona horaria, SMS, correos y .ics se configuran en Cal.com, no aquí.
  calendar: {
    link: 'alaria-hb0huy/valoracion',
    intro:
      'Elige el día y la hora que te queden mejor. Al reservar te llega la confirmación con un archivo para agregar la cita a tu calendario.',
    timezone: 'Los horarios están en hora de Guatemala.',
    fallback: '¿No carga el calendario? Ábrelo en Cal.com.',
  },
};

export const footer = {
  note: 'Alaria Medicina Estética. Medicina estética con criterio médico.',
  legal: '© 2026 Alaria Medicina Estética. [pendiente: aviso legal y número de colegiado]',
};
