export type Project = {
  id:string; title:string; slug:string; category:string; summary:string; description:string;
  year:string; cover_url:string|null; video_url:string|null; gallery_urls:string[];
  published:boolean; featured:boolean; sort_order:number; created_at?:string;
};

export type Capability = {title:string;description:string};
export type ProcessStep = {title:string;description:string};
export type LabExperiment = {eyebrow:string;title:string};

export type CreatorProgram = {
  id:string;
  name:string;
  organization:string;
  role:string;
  description:string;
  image_url:string|null;
  program_url:string;
  status:string;
  start_date:string;
  end_date:string;
  published:boolean;
  featured:boolean;
  sort_order:number;
  created_at?:string;
  updated_at?:string;
};

export type SiteContent = {
  logoText:string;
  headerNote:string;
  navWork:string;navAbout:string;navProcess:string;navLab:string;navPrograms:string;navCta:string;
  heroEyebrow:string;heroTitle:string;heroDescription:string;availabilityLabel:string;
  heroStampOne:string;heroStampTwo:string;heroArtCaption:string;heroFootnote:string;tickerItems:string[];
  workEyebrow:string;workKickerRight:string;workTitle:string;workAccentTitle:string;workDescription:string;
  aboutEyebrow:string;aboutKickerRight:string;aboutEyebrowSmall:string;aboutTitle:string;aboutBody:string;
  aboutExtra:string;aboutImageUrl:string;aboutImageAlt:string;aboutLinkText:string;
  capabilitiesEyebrow:string;capabilitiesKickerRight:string;capabilitiesTitle:string;capabilitiesAccentTitle:string;
  capabilitiesDescription:string;capabilities:Capability[];
  processEyebrow:string;processKickerRight:string;processTitle:string;processDescription:string;processSteps:ProcessStep[];
  labEyebrow:string;labKickerRight:string;labTitle:string;labAccentTitle:string;labDescription:string;labExperiments:LabExperiment[];
  programsEyebrow:string;programsTitle:string;programsDescription:string;
  contactEyebrow:string;contactKickerRight:string;contactMicrocopy:string;contactTitle:string;contactDescription:string;
  contactEmail:string;contactButtonText:string;
  footerDescription:string;footerBottomText:string;footerTagline:string;
  xUrl:string;instagramUrl:string;youtubeUrl:string;tiktokUrl:string;behanceUrl:string;linkedinUrl:string;
};

export type SiteContentTextKey = Exclude<keyof SiteContent,
  "tickerItems"|"capabilities"|"processSteps"|"labExperiments"
>;

export type Message = {
  id:string;name:string;email:string;project_type:string;message:string;created_at:string;read:boolean
};
