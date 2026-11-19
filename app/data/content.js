// Content model for the DS & AI resources site.
// Copy and URLs come verbatim from docs/reference/recursos-v1.html.
// Book files (PDF/EPUB) are never linked or hosted here.
// `image` points to deterministic artwork generated into `public/bubbles/<id>.webp`.

const SITE = 'https://www.itecriocuarto.org.ar';

export const KINDS = ['sitios', 'libros', 'canales', 'criterio'];

/** Human-readable label for each category kind (Spanish UI copy). */
export const KIND_LABELS = {
  sitios: 'Páginas recomendadas',
  libros: 'Lecturas recomendadas',
  canales: 'Canales de YouTube',
  criterio: 'Antes de darle play',
};

export const links = {
  officialSite: `${SITE}/inicio`,
  notebookLM: 'https://notebooklm.google.com',
};

export const coordination = {
  name: 'Coordinación de Ciencia de Datos e Inteligencia Artificial · iTec Río Cuarto',
  footer: 'Coordinación de la carrera de Ciencia de Datos e Inteligencia Artificial · iTec Río Cuarto',
  eyebrow: 'Coordinación · Ciencia de Datos e IA · iTec',
  title: 'Recursos para aprender datos e IA',
  subtitle:
    'Páginas, libros y canales que recomendamos para seguir aprendiendo fuera de clase. Todo es gratuito, salvo que se indique lo contrario.',
  officialSite: links.officialSite,
};

export const offers = [
  {
    id: 'conceptos',
    kind: 'sitios',
    title: 'Conceptos en acción',
    summary: 'Sitios interactivos donde los conceptos se ven en movimiento.',
    resources: [
      {
        name: 'Galería de marimo',
        url: 'https://marimo.io/gallery',
        host: 'marimo.io/gallery',
        description:
          'Notebooks interactivos de Python sobre datos, visualización y machine learning. Se pueden abrir y modificar en el navegador.',
      },
      {
        name: 'MLU-Explain',
        url: 'https://mlu-explain.github.io',
        host: 'mlu-explain.github.io',
        description:
          'Explicaciones visuales e interactivas de machine learning hechas por Amazon: regresión, árboles de decisión, sobreajuste, validación cruzada.',
      },
      {
        name: 'Seeing Theory',
        url: 'https://seeing-theory.brown.edu',
        host: 'seeing-theory.brown.edu',
        description: 'Probabilidad y estadística con visualizaciones interactivas, de la Universidad Brown.',
      },
      {
        name: 'Setosa – Explained Visually',
        url: 'https://setosa.io/ev',
        host: 'setosa.io/ev',
        description: 'PCA, autovalores, regresión y matrices explicados con animaciones.',
      },
      {
        name: 'Immersive Math',
        url: 'https://immersivemath.com/ila',
        host: 'immersivemath.com/ila',
        description: 'Un libro de álgebra lineal online con figuras interactivas.',
      },
      {
        name: 'R2D3',
        url: 'https://r2d3.us',
        host: 'r2d3.us',
        description: 'Una introducción visual a los árboles de decisión, contada como una historia con scroll.',
      },
    ],
    image: '/bubbles/conceptos.webp',
    imageAlt: 'Ilustración abstracta de curvas matemáticas y nodos interactivos en movimiento',
  },
  {
    id: 'redes-neuronales',
    kind: 'sitios',
    title: 'Redes neuronales',
    summary: 'Para jugar con redes neuronales y ver cómo funcionan por dentro.',
    resources: [
      {
        name: 'TensorFlow Playground',
        url: 'https://playground.tensorflow.org',
        host: 'playground.tensorflow.org',
        description: 'Entrenás una red neuronal en el navegador y ves cómo aprende.',
      },
      {
        name: 'CNN Explainer',
        url: 'https://poloclub.github.io/cnn-explainer',
        host: 'poloclub.github.io/cnn-explainer',
        description: 'Cómo funcionan por dentro las redes convolucionales.',
      },
      {
        name: 'Transformer Explainer',
        url: 'https://poloclub.github.io/transformer-explainer',
        host: 'poloclub.github.io/transformer-explainer',
        description: 'Cómo funcionan por dentro los modelos tipo GPT.',
      },
    ],
    image: '/bubbles/redes-neuronales.webp',
    imageAlt: 'Ilustración abstracta de capas y conexiones de una red neuronal',
  },
  {
    id: 'practicar',
    kind: 'sitios',
    title: 'Practicar y copiar ejemplos',
    summary: 'Lugares para practicar con código y copiar ejemplos listos para usar.',
    resources: [
      {
        name: 'Kaggle Learn',
        url: 'https://www.kaggle.com/learn',
        host: 'kaggle.com/learn',
        description:
          'Cursos cortos y gratuitos de Python, pandas, visualización y ML, con notebooks listos para ejecutar.',
      },
      {
        name: 'calmcode',
        url: 'https://calmcode.io',
        host: 'calmcode.io',
        description: 'Videos cortos de herramientas de datos en Python, de Vincent Warmerdam.',
      },
      {
        name: 'Python Graph Gallery',
        url: 'https://python-graph-gallery.com',
        host: 'python-graph-gallery.com',
        description: 'Cientos de gráficos con su código en matplotlib, seaborn y plotly.',
      },
      {
        name: 'Ejemplos de scikit-learn',
        url: 'https://scikit-learn.org/stable/auto_examples',
        host: 'scikit-learn.org/stable/auto_examples',
        description: 'La galería oficial, con un ejemplo de código para cada algoritmo.',
      },
    ],
    image: '/bubbles/practicar.webp',
    imageAlt: 'Ilustración abstracta de bloques de código y gráficos de datos',
  },
  {
    id: 'datos-reales',
    kind: 'sitios',
    title: 'Datos reales',
    summary: 'Datos globales con gráficos muy bien hechos y datasets descargables.',
    resources: [
      {
        name: 'Our World in Data',
        url: 'https://ourworldindata.org',
        host: 'ourworldindata.org',
        description: 'Datos globales con gráficos muy bien hechos. Los datasets se pueden descargar.',
      },
    ],
    image: '/bubbles/datos-reales.webp',
    imageAlt: 'Ilustración abstracta de mapas, series temporales y datos globales',
  },
  {
    id: 'libros',
    kind: 'libros',
    title: 'Libros para el verano',
    summary:
      'Tres lecturas, tres miradas: uno para programar los algoritmos desde cero, uno para la matemática que los sostiene y uno para entender para qué se usan.',
    books: [
      {
        title: 'Data Science from Scratch',
        author: 'Joel Grus',
        publisherYear: "O'Reilly · 2015",
        level: 'Intermedio',
        levelTone: 'default',
        description:
          'Un clásico para entender ciencia de datos programándola desde cero en Python, sin librerías que hagan la magia. Arma uno por uno los conceptos: álgebra lineal, estadística, descenso por gradiente, regresión, árboles de decisión, redes neuronales y clustering. Ideal si les gusta entender qué pasa adentro de cada algoritmo.',
        note: 'Ojo: esta edición usa Python 2.7, así que algunas sintaxis cambian en Python 3.',
      },
      {
        title: 'Linear Algebra, Data Science, and Machine Learning',
        author: 'Jeff Calder y Peter J. Olver',
        publisherYear: 'Springer · 2025',
        level: 'Exigente',
        levelTone: 'hard',
        description:
          'El más exigente. Arranca con vectores, matrices, ortogonalidad y autovalores, y lleva todo eso hasta machine learning: descomposición en valores singulares, PCA, optimización, grafos y redes neuronales, incluidos los transformers. Es para quienes quieran ver por qué el álgebra lineal está en el centro de la IA. Tiene nivel universitario: léanlo con paciencia y lápiz en mano.',
      },
      {
        title: 'Data Science for Decision Makers',
        author: 'Erik L. Herman',
        publisherYear: 'Mercury Learning · 2024',
        level: 'Accesible',
        levelTone: 'mid',
        description:
          'La mirada desde el otro lado: cómo usan los datos las organizaciones para tomar decisiones. Habla de estrategia, visualización y comunicación, analítica predictiva, ética y cultura organizacional basada en datos, con casos reales. Casi no tiene matemática y se lee rápido. Sirve para entender para qué se usa todo lo que aprenden.',
      },
    ],
    callout: {
      label: 'Un tutor para cada libro',
      textBefore: 'Pueden cargar el libro en ',
      linkLabel: 'NotebookLM',
      linkUrl: links.notebookLM,
      textAfter: ' y pedirle que les explique un capítulo, que les tome preguntas o que les resuma un tema.',
    },
    image: '/bubbles/libros.webp',
    imageAlt: 'Ilustración abstracta de volúmenes geométricos que evocan libros abiertos',
  },
  {
    id: 'canales',
    kind: 'canales',
    title: 'Canales de YouTube',
    summary: 'Para seguir aprendiendo fuera de clase.',
    note: 'La mayoría están en inglés. Si les cuesta, activen los subtítulos automáticos en español. Igual les sirve para practicar inglés, que les va a venir bien.',
    resources: [
      {
        name: '3Blue1Brown',
        url: 'https://www.youtube.com/@3blue1brown',
        host: 'youtube.com/@3blue1brown',
        description:
          'Explicaciones visuales de álgebra lineal, cálculo y redes neuronales. Su serie «Essence of Linear Algebra» es ideal para acompañar Álgebra.',
      },
      {
        name: 'IBM Technology',
        url: 'https://www.youtube.com/@IBMTechnology',
        host: 'youtube.com/@IBMTechnology',
        description:
          'Videos cortos y muy claros sobre conceptos de IA, datos y machine learning, explicados en una pizarra.',
      },
      {
        name: 'marimo',
        url: 'https://www.youtube.com/@marimo-team',
        host: 'youtube.com/@marimo-team',
        description:
          'Notebooks de Python reactivos. Busquen los videos de Vincent Warmerdam, un referente en ciencia de datos que explica con ejemplos prácticos y mucho criterio.',
      },
      {
        name: 'PyData',
        url: 'https://www.youtube.com/@PyDataTV',
        host: 'youtube.com/@PyDataTV',
        description:
          'Charlas de conferencias sobre el ecosistema de datos en Python: pandas, scikit-learn, visualización y casos reales.',
      },
    ],
    image: '/bubbles/canales.webp',
    imageAlt: 'Ilustración abstracta de ondas audiovisuales y pantallas en capas',
  },
  {
    id: 'criterio',
    kind: 'criterio',
    title: 'Cómo elegir fuentes',
    summary: 'Antes de darle play: cómo distinguir fuentes que explican del sensacionalismo.',
    guidance: {
      eyebrow: 'Antes de darle play',
      paragraphs: [
        'Como cualquier red social, YouTube funciona con algoritmos que buscan captar su atención. Por eso abundan títulos como «esto DESTRUYE a…», «se viene el fin de…» o «salió esto y cambia todo». Ese tono existe para que hagan clic, no para informar.',
        'Desconfíen del sensacionalismo, comparen fuentes y quédense con quien explica cómo funcionan las cosas, no con quien solo promete revoluciones.',
      ],
    },
    image: '/bubbles/criterio.webp',
    imageAlt: 'Ilustración abstracta de una brújula y filtros de lectura crítica',
  },
];
