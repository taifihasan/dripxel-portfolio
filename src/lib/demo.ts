import type {CreatorProgram,Project,SiteContent} from "../types";

export const defaultContent:SiteContent={
  logoText:"DRIPXEL",
  headerNote:"INDEPENDENT CREATIVE PRACTICE",
  navWork:"Work",navAbout:"About",navProcess:"Process",navLab:"Lab",navPrograms:"Programs",navCta:"LET'S CREATE",
  heroEyebrow:"INDEPENDENT AI CREATOR / VISUAL STORYTELLER",
  heroTitle:"IMAGINATION,\nWITHOUT LIMITS.",
  heroDescription:"I turn unconventional ideas into visual experiences through AI, motion and creative experimentation.",
  availabilityLabel:"AVAILABLE FOR SELECT COLLABORATIONS",
  heroStampOne:"CREATIVE\nENERGY",heroStampTwo:"IDEAS IN\nMOTION",
  heroArtCaption:"FIG. 001 — A PLAYGROUND FOR IDEAS",
  heroFootnote:"ARTIFICIAL INTELLIGENCE × HUMAN IMAGINATION",
  tickerItems:["AI FILMMAKING","VISUAL STORYTELLING","ART DIRECTION","MOTION EXPERIMENTS","DIGITAL WORLDBUILDING","PRODUCT VISUALS"],
  workEyebrow:"01 / SELECTED WORK",workKickerRight:"A COLLECTION OF IDEAS IN MOTION",
  workTitle:"MADE TO",workAccentTitle:"MAKE YOU LOOK.",
  workDescription:"Selected visual stories, experiments and concepts. Every frame starts with a question: what if?",
  aboutEyebrow:"02 / BEHIND THE PIXELS",aboutKickerRight:"THE PERSON BEHIND THE PROCESS",
  aboutEyebrowSmall:"A LITTLE ABOUT ME",
  aboutTitle:"NOT JUST CREATING IMAGES. CREATING EXPERIENCES.",
  aboutBody:"I'm Dripxel, an independent AI creator exploring the boundaries between imagination, artificial intelligence and visual storytelling. I transform abstract ideas into expressive visuals, develop cinematic concepts and experiment with emerging creative technologies.",
  aboutExtra:"",aboutImageUrl:"",aboutImageAlt:"Dripxel creator profile",aboutLinkText:"LET'S TALK ABOUT IDEAS",
  capabilitiesEyebrow:"03 / CREATIVE CAPABILITIES",capabilitiesKickerRight:"TOOLS ARE ONLY THE BEGINNING",
  capabilitiesTitle:"WHAT I BRING",capabilitiesAccentTitle:"TO THE FRAME.",
  capabilitiesDescription:"From the first spark of an idea to the final frame, I bring curiosity, direction and a willingness to experiment.",
  capabilities:[
    {title:"AI FILMMAKING",description:"Building visual narratives and cinematic sequences."},
    {title:"VISUAL STORYTELLING",description:"Turning a simple thought into a visual journey."},
    {title:"AI ART DIRECTION",description:"Finding a clear visual language for every project."},
    {title:"PRODUCT VISUALS",description:"Creating expressive product concepts and campaigns."},
    {title:"MOTION EXPERIMENTS",description:"Exploring rhythm, transitions and the unexpected."}
  ],
  processEyebrow:"04 / THE CREATIVE PROCESS",processKickerRight:"FROM FIRST THOUGHT TO FINAL FRAME",
  processTitle:"IDEAS DON'T\nMAKE THEMSELVES.",
  processDescription:"Every project follows its own path. This is the thinking behind the making.",
  processSteps:[
    {title:"DISCOVER",description:"Understand the idea, audience and what the work needs to make someone feel."},
    {title:"CONCEPTUALIZE",description:"Build the visual direction, references, mood and narrative approach."},
    {title:"CREATE",description:"Experiment with tools, composition, continuity and motion."},
    {title:"REFINE",description:"Polish the details, strengthen the story and prepare the final experience."}
  ],
  labEyebrow:"05 / THE PLAYGROUND",labKickerRight:"NO RULES. JUST CURIOSITY.",
  labTitle:"WELCOME TO",labAccentTitle:"THE LAB.",
  labDescription:"Not every experiment needs a brief. Some ideas are worth exploring just to see where they lead.",
  labExperiments:[
    {eyebrow:"EXPERIMENT / 001",title:"FORM\nSTUDIES"},
    {eyebrow:"EXPERIMENT / 002",title:"ODD\nWORLDS"},
    {eyebrow:"EXPERIMENT / 003",title:"MOTION\nNOTES"}
  ],
  programsEyebrow:"06 / CREATOR COMMUNITY",programsTitle:"PROGRAMS & PARTNERSHIPS.",
  programsDescription:"Creative communities, programs and collaborations that are part of the journey.",
  contactEyebrow:"07 / START SOMETHING",contactKickerRight:"OPEN FOR SELECT COLLABORATIONS",
  contactMicrocopy:"YOUR IDEA, MY NEXT OBSESSION ✳",
  contactTitle:"HAVE AN IDEA?\nLET'S MAKE IT REAL.",
  contactDescription:"Have a creative project, an unusual concept or an idea worth exploring? Let's create something distinctive.",
  contactEmail:"",contactButtonText:"SEND YOUR IDEA",
  footerDescription:"INDEPENDENT AI CREATOR\nVISUAL STORYTELLER / CREATIVE EXPERIMENTER",
  footerBottomText:"© {year} DRIPXEL. ALL IDEAS RESERVED.",
  footerTagline:"BUILT FOR THE CURIOUS ✳",
  xUrl:"",instagramUrl:"",youtubeUrl:"",tiktokUrl:"",behanceUrl:"",linkedinUrl:""
};

export const categories=[
  "AI Films","Cinematic Visuals","Product Ads","Memes","Short Stories",
  "Experimental Art","Motion Design","Digital Worlds","Other"
];

export const demoProjects:Project[]=[
  {id:"demo-1",title:"A World Between Frames",slug:"a-world-between-frames",category:"AI Films",summary:"A visual study in atmosphere, scale and impossible places.",description:"Sample concept content. Replace this with Dripxel's real project story and media before launch.",year:"2026",cover_url:null,video_url:null,gallery_urls:[],published:true,featured:true,sort_order:1},
  {id:"demo-2",title:"Objects of Tomorrow",slug:"objects-of-tomorrow",category:"Product Ads",summary:"A speculative product campaign built around material and light.",description:"Sample concept content. Replace this with an actual project before launch.",year:"2026",cover_url:null,video_url:null,gallery_urls:[],published:true,featured:true,sort_order:2},
  {id:"demo-3",title:"Tiny Worlds, Big Stories",slug:"tiny-worlds-big-stories",category:"Short Stories",summary:"A miniature visual narrative with a larger emotional point of view.",description:"Sample concept content. Replace this with real work before launch.",year:"2026",cover_url:null,video_url:null,gallery_urls:[],published:true,featured:false,sort_order:3},
  {id:"demo-4",title:"Signal / Noise",slug:"signal-noise",category:"Experimental Art",summary:"An exploration of motion, distortion and visual rhythm.",description:"Sample concept content. Replace this with a real experiment or remove it.",year:"2026",cover_url:null,video_url:null,gallery_urls:[],published:true,featured:false,sort_order:4}
];

export const emptyCreatorProgram:Partial<CreatorProgram>={
  name:"",organization:"",role:"Creator",description:"",image_url:null,program_url:"",
  status:"Active",start_date:"",end_date:"",published:false,featured:false,sort_order:99
};
