import {useEffect,useMemo,useState,type FormEvent} from "react";
import {
  ArrowDown,ArrowDownRight,ArrowLeft,ArrowUpRight,Asterisk,
  Award,Check,Clapperboard,ExternalLink,Eye,EyeOff,Film,Instagram,
  Layers3,LockKeyhole,Menu,Plus,Send,Sparkles,Trash2,
  X,Youtube,Zap,LayoutDashboard,FolderKanban,Image as ImageIcon,
  Mail,Settings2,Clock3
} from "lucide-react";
import {supabase,isSupabaseConfigured} from "./lib/supabase";
import {categories,defaultContent,demoProjects} from "./lib/demo";
import type {
  CreatorProgram,Message,Project,SiteContent,SiteContentTextKey
} from "./types";

function useReveal(){
  useEffect(()=>{
    const find=()=>document.querySelectorAll<HTMLElement>("[data-reveal]");
    if(!("IntersectionObserver"in window)){find().forEach(e=>e.classList.add("visible"));return;}
    const observed=new WeakSet<Element>();
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target);}
    }),{threshold:.12});
    const scan=()=>find().forEach(e=>{if(!observed.has(e)){observed.add(e);io.observe(e);}});
    scan();
    const mutation=new MutationObserver(scan);
    mutation.observe(document.body,{childList:true,subtree:true});
    return()=>{mutation.disconnect();io.disconnect();};
  },[]);
}

function Brand({name=defaultContent.logoText,href="#top"}:{name?:string;href?:string}){
  const brand=name.trim()||"DRIPXEL";
  const x=brand.toUpperCase().indexOf("X");
  return <a className="logo" href={href}>
    {x>=0?<>{brand.slice(0,x)}<span>{brand.slice(x,x+1)}</span>{brand.slice(x+1)}</>:brand}
    <i>.</i>
  </a>;
}

function Art({project,index}:{project:Project;index:number}){
  return project.cover_url
    ?<img className="cover" src={project.cover_url} alt={project.title} loading="lazy" onLoad={e=>{
      const frame=e.currentTarget.closest<HTMLElement>(".project-image");
      if(!frame)return;
      const ratio=e.currentTarget.naturalWidth/e.currentTarget.naturalHeight;
      frame.dataset.mediaRatio=ratio<.82?"portrait":ratio>1.45?"landscape":"square";
    }}/>
    :<div className={`art art-${index%4}`}>
      <div className="art-ring"/><div className="art-ring second"/>
      <div className="art-ball"/><small>DX / {String(index+1).padStart(2,"0")}</small><b>VISUAL STUDY</b>
    </div>;
}

function ProjectView({project,index,onClose}:{project:Project;index:number;onClose:()=>void}){
  useEffect(()=>{
    const f=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();};
    window.addEventListener("keydown",f);
    document.body.style.overflow="hidden";
    return()=>{window.removeEventListener("keydown",f);document.body.style.overflow="";};
  },[onClose]);
  return <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <article className="project-view">
      <button className="close" onClick={onClose} aria-label="Close project"><X/></button>
      <div className="view-art"><Art project={project} index={index}/></div>
      <div className="view-copy">
        <small>PROJECT / {String(index+1).padStart(2,"0")} · {project.category}</small>
        <h2>{project.title}</h2><h3>{project.summary}</h3><p>{project.description}</p>
        {project.video_url&&<video src={project.video_url} controls playsInline/>}
        {project.gallery_urls?.map(url=><img key={url} src={url} alt={project.title}/>)}
        <button className="plain-link" onClick={onClose}><ArrowLeft/> BACK TO WORK</button>
      </div>
    </article>
  </div>;
}

const capabilityIcons=[Film,Layers3,Sparkles,Zap,Clapperboard];

function lineBreaks(value:string){
  return String(value??"").replace(/\\n/g,"\n").replace(/\r\n/g,"\n").split("\n");
}
function displayText(value:string){
  return String(value??"").replace(/\\n/g,"\n").replace(/\r\n/g,"\n");
}

function normalizeContent(value:unknown):SiteContent{
  const source=value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
  const next:Record<string,unknown>={...defaultContent,...source};
  ["navProcess","navLab","processEyebrow","processKickerRight","processTitle","processDescription","processSteps","labEyebrow","labKickerRight","labTitle","labAccentTitle","labDescription","labExperiments"].forEach(key=>delete next[key]);
  return next as unknown as SiteContent;
}

function Portfolio(){
  useReveal();
  const [content,setContent]=useState(defaultContent);
  const [projects,setProjects]=useState(demoProjects);
  const [programs,setPrograms]=useState<CreatorProgram[]>([]);
  const [category,setCategory]=useState("All");
  const [selected,setSelected]=useState<Project|null>(null);
  const [menu,setMenu]=useState(false);
  const [activeSection,setActiveSection]=useState("work");
  const [status,setStatus]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{
    const client=supabase;
    if(!client)return;
    let live=true;
    Promise.all([
      client.from("site_content").select("value").eq("key","homepage").maybeSingle(),
      client.from("projects").select("*").eq("published",true).order("sort_order"),
      client.from("creator_programs").select("*").eq("published",true).order("sort_order")
    ]).then(([c,p,cp])=>{
      if(!live)return;
      if(c.data?.value)setContent(normalizeContent(c.data.value));
      if(p.data)setProjects(p.data as Project[]);
      if(cp.data)setPrograms(cp.data as CreatorProgram[]);
    });
    return()=>{live=false;};
  },[]);

  useEffect(()=>{
    if(!("IntersectionObserver" in window))return;
    const ids=["work","about","capabilities",...(programs.length?["programs"]:[]),"contact"];
    const elements=ids.map(id=>document.getElementById(id)).filter((el):el is HTMLElement=>!!el);
    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible)setActiveSection((visible.target as HTMLElement).id);
    },{rootMargin:"-24% 0px -58% 0px",threshold:[0,.15,.35,.55]});
    elements.forEach(element=>observer.observe(element));
    return()=>observer.disconnect();
  },[programs.length]);

  const filtered=useMemo(
    ()=>category==="All"?projects:projects.filter(p=>p.category===category),
    [category,projects]
  );

  async function sendMessage(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const formElement=e.currentTarget;
    setError("");
    const fd=new FormData(formElement);
    const row={
      name:String(fd.get("name")||""),
      email:String(fd.get("email")||""),
      project_type:String(fd.get("type")||"General"),
      message:String(fd.get("message")||"")
    };
    if(!supabase){setError("Connect Supabase to activate the contact inbox.");return;}
    setStatus("Sending...");
    const {error}=await supabase.from("contact_messages").insert(row);
    if(error){setError(error.message);setStatus("");}
    else{setStatus("Message sent. Thank you.");formElement.reset();}
  }

  return <div className="site">
    <header className="header">
      <Brand name={content.logoText}/>
      <div className="header-note"><i/> {content.headerNote}</div>
      <nav className={menu?"nav open":"nav"} aria-label="Main navigation">
        <a className={activeSection==="work"?"active":""} aria-current={activeSection==="work"?"location":undefined} href="#work" onClick={()=>setMenu(false)}>{content.navWork}</a>
        <a className={activeSection==="about"?"active":""} aria-current={activeSection==="about"?"location":undefined} href="#about" onClick={()=>setMenu(false)}>{content.navAbout}</a>
        <a className={activeSection==="capabilities"?"active":""} aria-current={activeSection==="capabilities"?"location":undefined} href="#capabilities" onClick={()=>setMenu(false)}>{content.navCapabilities}</a>
        {programs.length>0&&<a className={activeSection==="programs"?"active":""} aria-current={activeSection==="programs"?"location":undefined} href="#programs" onClick={()=>setMenu(false)}>{content.navPrograms}</a>}
        <a className={activeSection==="contact"?"active":""} aria-current={activeSection==="contact"?"location":undefined} href="#contact" onClick={()=>setMenu(false)}>{content.navCta} <ArrowUpRight size={14}/></a>
      </nav>
      <button className="mobile-toggle" onClick={()=>setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}>{menu?<X/>:<Menu/>}</button>
    </header>

    <main id="top">
      <section className="hero">
        <div className="microline">
          <span>{content.heroEyebrow}</span>
          <span>{content.availabilityLabel} <i/></span>
        </div>
        <div className="hero-title">
          <h1>{lineBreaks(content.heroTitle).map((x,i)=><span key={i} className={i===1?"blue":""}>{x}</span>)}</h1>
          <aside><small>01 / 05</small><p>{content.heroDescription}</p><a href="#work"><ArrowDownRight/></a></aside>
        </div>
        <div className="hero-art">
          <div className="grid-bg"/>
          <span className="stamp stamp-a">{lineBreaks(content.heroStampOne).map((v,i)=><span key={i}>{v}<br/></span>)} <Asterisk/></span>
          <span className="stamp stamp-b">{lineBreaks(content.heroStampTwo).map((v,i)=><span key={i}>{v}<br/></span>)} <i>DX</i></span>
          <div className="blob blob-blue"><small>01</small></div>
          <div className="blob blob-lime"><small>02</small></div>
          <div className="orbit"><i/></div>
          <div className="mini-card card-dark"><small>VISUAL EXPERIMENT / 026</small><div className="mini-art"/></div>
          <div className="mini-card card-lime"><Asterisk/><b>MAKE<br/>SOMETHING<br/>UNEXPECTED.</b><small>DX—LAB</small></div>
          <div className="art-foot"><span>{content.heroArtCaption}</span><span>SCROLL TO EXPLORE <ArrowDown size={13}/></span></div>
        </div>
        <div className="hero-foot"><span>{content.heroFootnote}</span><a href="#work">EXPLORE SELECTED WORK <ArrowDownRight size={14}/></a></div>
      </section>

      <div className="ticker"><div>{[0,1].map(i=><span key={i}>{content.tickerItems.map((item,j)=><span className="ticker-item" key={`${i}-${j}`}>{item} <Asterisk/></span>)}</span>)}</div></div>

      <section className="section work" id="work">
        <div className="kicker" data-reveal><span>{content.workEyebrow}</span><span>{content.workKickerRight}</span></div>
        <div className="section-head" data-reveal><h2>{content.workTitle}<br/><em>{content.workAccentTitle}</em></h2><p>{content.workDescription}</p></div>
        <div className="filters" data-reveal>
          {["All",...Array.from(new Set(projects.map(p=>p.category)))].map(c=><button className={category===c?"active":""} key={c} onClick={()=>setCategory(c)}>{c}</button>)}
        </div>
        <div className="projects">
          {filtered.map((p,i)=><button className={`project project-${i%2}`} key={p.id} onClick={()=>setSelected(p)} data-reveal aria-label={`Open project: ${p.title}`}
            onMouseEnter={e=>{const video=e.currentTarget.querySelector<HTMLVideoElement>(".project-preview-video");if(video)void video.play().catch(()=>{});}}
            onMouseLeave={e=>{const video=e.currentTarget.querySelector<HTMLVideoElement>(".project-preview-video");if(video){video.pause();video.currentTime=0;}}}
            onFocus={e=>{const video=e.currentTarget.querySelector<HTMLVideoElement>(".project-preview-video");if(video)void video.play().catch(()=>{});}}
            onBlur={e=>{const video=e.currentTarget.querySelector<HTMLVideoElement>(".project-preview-video");if(video){video.pause();video.currentTime=0;}}}>
            <div className="project-image"><Art project={p} index={i}/>{p.video_url&&<video className="project-preview-video" src={p.video_url} muted loop playsInline preload="none" aria-hidden="true" onLoadedMetadata={e=>{
              const frame=e.currentTarget.closest<HTMLElement>(".project-image");
              if(!frame||p.cover_url)return;
              const ratio=e.currentTarget.videoWidth/e.currentTarget.videoHeight;
              frame.dataset.mediaRatio=ratio<.82?"portrait":ratio>1.45?"landscape":"square";
            }}/>}<span className="project-index">DX / {String(i+1).padStart(2,"0")}</span>{p.featured&&<span className="project-featured">FEATURED</span>}<i><ArrowUpRight/></i></div>
            <div className="project-info"><div><div className="project-info-meta"><small>{p.category}</small><span>{p.year}</span></div><h3>{p.title}</h3><p>{p.summary}</p></div><ArrowUpRight/></div>
          </button>)}
        </div>
        {!filtered.length&&<p className="empty-public">New work is on the way.</p>}
      </section>

      <section className="section about" id="about">
        <div className="kicker" data-reveal><span>{content.aboutEyebrow}</span><span>{content.aboutKickerRight}</span></div>
        <div className="about-grid">
          <div className={`about-art ${content.aboutImageUrl?"has-image":""}`} data-reveal>
            {content.aboutImageUrl&&<img className="about-photo" src={content.aboutImageUrl} alt={content.aboutImageAlt||"Dripxel creator profile"} loading="lazy"/>}
            <div className="about-ring"/><div className="about-ring two"/>
            {!content.aboutImageUrl&&<><strong>D<span>X</span></strong><small>THINK<br/>DIFFERENT.</small><b>STAY<br/>CURIOUS.</b></>}
            <span className="about-badge">AI CREATOR / VISUAL STORYTELLER</span>
            <label>CREATIVE ID / DX—001</label>
          </div>
          <div className="about-copy" data-reveal>
            <small>✳ {content.aboutEyebrowSmall}</small><h2>{content.aboutTitle}</h2>
            <p>{content.aboutBody}</p>{content.aboutExtra&&<p>{content.aboutExtra}</p>}
            <a href="#contact">{content.aboutLinkText} <ArrowUpRight/></a>
          </div>
        </div>
      </section>

      <section className="section capabilities" id="capabilities">
        <div className="kicker" data-reveal><span>{content.capabilitiesEyebrow}</span><span>{content.capabilitiesKickerRight}</span></div>
        <div className="section-head" data-reveal><h2>{content.capabilitiesTitle}<br/><em>{content.capabilitiesAccentTitle}</em></h2><p>{content.capabilitiesDescription}</p></div>
        {content.capabilities.map((item,i)=>{
          const Icon=capabilityIcons[i%capabilityIcons.length];
          return <div className="cap-row" key={`${item.title}-${i}`} data-reveal><small>{String(i+1).padStart(2,"0")}</small><h3>{item.title}</h3><p>{item.description}</p><Icon/></div>;
        })}
      </section>

      {programs.length>0&&<section className="section programs" id="programs">
        <div className="kicker" data-reveal><span>{content.programsEyebrow}</span><span>CREATIVE COMMUNITY / COLLABORATIONS</span></div>
        <div className="section-head" data-reveal><h2>{content.programsTitle}</h2><p>{content.programsDescription}</p></div>
        <div className="program-grid">{programs.map(p=><article className="program-card" key={p.id} data-reveal>
          <div className="program-image">{p.image_url?<img src={p.image_url} alt={p.name}/>:<div className="program-monogram"><Award/><span>{p.organization||p.name}</span></div>}</div>
          <div className="program-copy"><small>{p.role} {p.status&&` / ${p.status}`} {p.start_date&&` · ${p.start_date}`} {p.end_date&&` – ${p.end_date}`}</small><h3>{p.name}</h3>{p.organization&&<h4>{p.organization}</h4>}<p>{p.description}</p>
            {p.program_url&&<a href={p.program_url} target="_blank" rel="noreferrer">EXPLORE PROGRAM <ExternalLink size={14}/></a>}
          </div>
        </article>)}</div>
      </section>}

      <section className="section contact" id="contact">
        <div className="kicker light" data-reveal><span>{content.contactEyebrow}</span><span>{content.contactKickerRight}</span></div>
        <div className="contact-grid">
          <div data-reveal><small>{content.contactMicrocopy}</small><h2>{displayText(content.contactTitle)}</h2><p>{content.contactDescription}</p>
            {content.contactEmail&&<a className="email-link" href={`mailto:${content.contactEmail}`}>{content.contactEmail} <ArrowUpRight/></a>}
          </div>
          <form onSubmit={sendMessage} data-reveal>
            <label>Your name<input name="name" required placeholder="What should I call you?"/></label>
            <label>Email address<input name="email" type="email" required placeholder="you@example.com"/></label>
            <label>Project type<select name="type"><option>Creative collaboration</option><option>AI film / short story</option><option>Product visual / advertisement</option><option>Visual experiment</option><option>Something else</option></select></label>
            <label>Your message<textarea name="message" required rows={3} placeholder="A rough idea is more than enough to start..."/></label>
            {error&&<p className="error">{error}</p>}{status&&<p className="success">{status}</p>}
            <button type="submit">{content.contactButtonText} <Send size={16}/></button>
          </form>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand-block"><Brand name={content.logoText}/><span>INDEPENDENT CREATIVE PRACTICE</span></div>
        <div className="footer-top-copy"><p>{displayText(content.footerDescription)}</p><a className="footer-contact-link" href="#contact">HAVE A PROJECT IN MIND? <ArrowUpRight size={15}/></a></div>
      </div>
      <div className="footer-social-row">
        <div className="footer-social-heading"><span>LET'S CONNECT</span><small>GOOD IDEAS START WITH A CONVERSATION.</small></div>
        <div className="footer-socials">
          {content.xUrl&&<a className="footer-social" href={content.xUrl} target="_blank" rel="noreferrer" aria-label="Visit Dripxel on X"><b className="social-letter">𝕏</b><span><small>FOLLOW / UPDATES</small><strong>X</strong></span><ArrowUpRight size={15}/></a>}
          {content.telegramUrl&&<a className="footer-social" href={content.telegramUrl} target="_blank" rel="noreferrer" aria-label="Contact Dripxel on Telegram"><Send size={18}/><span><small>MESSAGE / CHAT</small><strong>TELEGRAM</strong></span><ArrowUpRight size={15}/></a>}
          {content.contactEmail&&<a className="footer-social" href={`mailto:${content.contactEmail}`} aria-label={`Email Dripxel at ${content.contactEmail}`}><Mail size={18}/><span><small>DIRECT / CONTACT</small><strong>EMAIL ME</strong></span><ArrowUpRight size={15}/></a>}
          {content.instagramUrl&&<a className="footer-social" href={content.instagramUrl} target="_blank" rel="noreferrer" aria-label="Visit Dripxel on Instagram"><Instagram size={18}/><span><small>VISUALS / SOCIAL</small><strong>INSTAGRAM</strong></span><ArrowUpRight size={15}/></a>}
          {content.youtubeUrl&&<a className="footer-social" href={content.youtubeUrl} target="_blank" rel="noreferrer" aria-label="Visit Dripxel on YouTube"><Youtube size={18}/><span><small>FILMS / VIDEOS</small><strong>YOUTUBE</strong></span><ArrowUpRight size={15}/></a>}
          {content.tiktokUrl&&<a className="footer-social" href={content.tiktokUrl} target="_blank" rel="noreferrer" aria-label="Visit Dripxel on TikTok"><b className="social-letter">TT</b><span><small>SHORT FORM / SOCIAL</small><strong>TIKTOK</strong></span><ArrowUpRight size={15}/></a>}
          {content.behanceUrl&&<a className="footer-social" href={content.behanceUrl} target="_blank" rel="noreferrer" aria-label="Visit Dripxel on Behance"><b className="social-letter">Be</b><span><small>PORTFOLIO / DESIGN</small><strong>BEHANCE</strong></span><ArrowUpRight size={15}/></a>}
          {content.linkedinUrl&&<a className="footer-social" href={content.linkedinUrl} target="_blank" rel="noreferrer" aria-label="Visit Dripxel on LinkedIn"><b className="social-letter">in</b><span><small>NETWORK / CAREER</small><strong>LINKEDIN</strong></span><ArrowUpRight size={15}/></a>}
        </div>
      </div>
      <div className="footer-bottom">
        <span>{content.footerBottomText.replace("{year}",String(new Date().getFullYear()))}</span>
        <span>{content.footerTagline}</span>
        <a className="footer-back-top" href="#top">BACK TO TOP <ArrowUpRight size={15}/></a>
      </div>
    </footer>
    {selected&&<ProjectView project={selected} index={projects.findIndex(p=>p.id===selected.id)} onClose={()=>setSelected(null)}/>}
  </div>;
}

type Tab="Overview"|"Projects"|"Creator Programs"|"Content"|"Media"|"Inbox";
type ContentGroup="Navigation"|"Hero"|"Work"|"About"|"Capabilities"|"Programs"|"Contact"|"Footer"|"Social";

const contentGroups:ContentGroup[]=["Navigation","Hero","Work","About","Capabilities","Programs","Contact","Footer","Social"];

function Studio(){
  const [ready,setReady]=useState(false),[owner,setOwner]=useState(false);
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[userEmail,setUserEmail]=useState("");
  const [error,setError]=useState(""),[busy,setBusy]=useState(false),[tab,setTab]=useState<Tab>("Overview"),[notice,setNotice]=useState("");
  const [projects,setProjects]=useState<Project[]>([]),[programs,setPrograms]=useState<CreatorProgram[]>([]);
  const [messages,setMessages]=useState<Message[]>([]),[content,setContent]=useState<SiteContent>(defaultContent);
  const [editing,setEditing]=useState<Project|null>(null),[editor,setEditor]=useState(false);
  const [editingProgram,setEditingProgram]=useState<CreatorProgram|null>(null),[programEditor,setProgramEditor]=useState(false);
  const [media,setMedia]=useState<{name:string;url:string}[]>([]);
  const [contentGroup,setContentGroup]=useState<ContentGroup>("Navigation");

  async function verify(){
    const client=supabase;
    if(!client){setReady(true);return;}
    const {data}=await client.auth.getSession();
    if(!data.session){setReady(true);return;}
    const user=data.session.user;
    const {data:row}=await client.from("studio_owners").select("user_id").eq("user_id",user.id).maybeSingle();
    if(row){setOwner(true);setUserEmail(user.email||"");}
    else{await client.auth.signOut();setError("This account is not authorized as the studio owner.");}
    setReady(true);
  }
  useEffect(()=>{void verify();},[]);

  async function load(){
    const client=supabase;
    if(!client)return;
    const [p,m,c,cp]=await Promise.all([
      client.from("projects").select("*").order("sort_order"),
      client.from("contact_messages").select("*").order("created_at",{ascending:false}),
      client.from("site_content").select("value").eq("key","homepage").maybeSingle(),
      client.from("creator_programs").select("*").order("sort_order")
    ]);
    if(p.data)setProjects(p.data as Project[]);
    if(m.data)setMessages(m.data as Message[]);
    if(c.data?.value)setContent(normalizeContent(c.data.value));
    if(cp.data)setPrograms(cp.data as CreatorProgram[]);
    else if(cp.error)setNotice(`Creator Programs migration required: ${cp.error.message}`);
  }
  useEffect(()=>{if(owner)void load();},[owner]);

  async function signIn(e:FormEvent){
    e.preventDefault();
    const client=supabase;
    if(!client)return;
    setBusy(true);setError("");
    const {error}=await client.auth.signInWithPassword({email,password});
    if(error)setError(error.message);else await verify();
    setBusy(false);
  }
  async function signOut(){
    await supabase?.auth.signOut();
    setOwner(false);setUserEmail("");
  }
  async function upload(file:File,folder:string){
    const client=supabase;
    if(!client)throw new Error("Supabase is not configured.");
    const name=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${folder}/${crypto.randomUUID()}-${name}`;
    const {error}=await client.storage.from("media").upload(path,file,{contentType:file.type});
    if(error)throw error;
    return client.storage.from("media").getPublicUrl(path).data.publicUrl;
  }
  async function saveProject(data:Partial<Project>){
    const client=supabase;if(!client)return;
    setBusy(true);
    const payload={...data,slug:data.slug||String(data.title||"project").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),updated_at:new Date().toISOString()};
    const result=data.id?await client.from("projects").update(payload).eq("id",data.id):await client.from("projects").insert(payload);
    if(result.error)setNotice(result.error.message);
    else{setNotice("Project saved.");setEditor(false);setEditing(null);await load();}
    setBusy(false);
  }
  async function saveProgram(data:Partial<CreatorProgram>){
    const client=supabase;if(!client)return;
    setBusy(true);
    const payload={...data,updated_at:new Date().toISOString()};
    const result=data.id?await client.from("creator_programs").update(payload).eq("id",data.id):await client.from("creator_programs").insert(payload);
    if(result.error)setNotice(result.error.message);
    else{setNotice("Creator program saved.");setProgramEditor(false);setEditingProgram(null);await load();}
    setBusy(false);
  }
  async function saveContent(e:FormEvent){
    e.preventDefault();const client=supabase;if(!client)return;
    setBusy(true);
    const {error}=await client.from("site_content").upsert({key:"homepage",value:content,updated_at:new Date().toISOString()});
    setNotice(error?error.message:"Website content saved successfully.");
    setBusy(false);
  }
  async function deleteProject(p:Project){
    const client=supabase;if(!client||!confirm(`Delete ${p.title}?`))return;
    const {error}=await client.from("projects").delete().eq("id",p.id);
    setNotice(error?error.message:"Project deleted.");await load();
  }
  async function deleteProgram(p:CreatorProgram){
    const client=supabase;if(!client||!confirm(`Delete creator program "${p.name}"?`))return;
    const {error}=await client.from("creator_programs").delete().eq("id",p.id);
    setNotice(error?error.message:"Creator program deleted.");await load();
  }
  async function toggleProgramPublished(p:CreatorProgram){
    const client=supabase;if(!client)return;
    const {error}=await client.from("creator_programs").update({published:!p.published,updated_at:new Date().toISOString()}).eq("id",p.id);
    setNotice(error?error.message:(p.published?"Program unpublished.":"Program published."));
    await load();
  }
  async function loadMedia(){
    const client=supabase;if(!client)return;
    const {data,error}=await client.storage.from("media").list("general",{limit:100,sortBy:{column:"created_at",order:"desc"}});
    if(error){setNotice(error.message);return;}
    setMedia((data||[]).map(f=>({name:f.name,url:client.storage.from("media").getPublicUrl(`general/${f.name}`).data.publicUrl})));
  }
  useEffect(()=>{if(owner&&tab==="Media")void loadMedia();},[owner,tab]);

  const unread=messages.filter(m=>!m.read).length;
  const updateText=(key:SiteContentTextKey,value:string)=>setContent(current=>({...current,[key]:value}));
  const textField=(key:SiteContentTextKey,label:string,multiline=false)=>(
    <label className="cms-field" key={key}>{label}
      {multiline
        ?<textarea rows={4} value={displayText(content[key])} onChange={e=>updateText(key,e.target.value)}/>
        :<input value={displayText(content[key])} onChange={e=>updateText(key,e.target.value)}/>}
    </label>
  );

  if(!isSupabaseConfigured)return <div className="setup"><div><Brand href="/"/><LockKeyhole/><h1>Studio setup required.</h1><p>Configure the Supabase project URL and publishable key in the environment before enabling owner authentication, database editing and persistent uploads.</p><code>VITE_SUPABASE_URL<br/>VITE_SUPABASE_ANON_KEY</code><a href="/">← Back to portfolio</a></div></div>;
  if(!ready)return <div className="setup">Checking studio access…</div>;
  if(!owner)return <div className="login"><form onSubmit={signIn}><Brand href="/"/><LockKeyhole/><small>PRIVATE OWNER WORKSPACE</small><h1>Good to have<br/>you back.</h1><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className="error">{error}</p>}<button disabled={busy}>{busy?"SIGNING IN…":"ENTER STUDIO"} <ArrowUpRight/></button><small>Access is restricted to an authorized owner.</small></form></div>;

  return <div className="admin">
    <aside>
      <div className="admin-brand"><Brand href="/"/><span>CREATIVE CONTROL / 01</span></div>
      <div className="admin-side-label">WORKSPACE</div>
      <nav>{([
        ["Overview",LayoutDashboard],
        ["Projects",FolderKanban],
        ["Creator Programs",Award],
        ["Content",Layers3],
        ["Media",ImageIcon],
        ["Inbox",Mail]
      ] as const).map(([t,Icon])=><button className={tab===t?"chosen":""} key={t} onClick={()=>setTab(t)}><Icon size={16}/><span>{t}</span>{t==="Inbox"&&unread>0?<i>{unread}</i>:null}</button>)}</nav>
      <div className="admin-side-bottom"><div className="admin-status"><i/> ALL SYSTEMS READY</div><div className="admin-user"><small>OWNER SESSION</small><span>{userEmail}</span><button onClick={signOut}>SIGN OUT <ArrowUpRight size={13}/></button></div></div>
    </aside>
    <main>
      <header><div className="admin-crumb"><span>DRIPXEL STUDIO</span><i>/</i>{tab.toUpperCase()}</div><div className="admin-header-actions"><span><i/> PRIVATE WORKSPACE</span><a href="/" target="_blank" rel="noreferrer">VIEW LIVE SITE <ArrowUpRight size={13}/></a></div></header>
      {notice&&<div className="notice">{notice}<button onClick={()=>setNotice("")}>×</button></div>}

      {tab==="Overview"&&<section className="studio-overview">
        <div className="studio-welcome">
          <div><small>WORKSPACE OVERVIEW / YOUR CREATIVE HQ</small><h1>Make something<br/><em>remarkable.</em></h1><p>Your creative work, published stories and collaborations — all in one place.</p></div>
          <div className="welcome-orbit"><div className="welcome-orbit-ring"/><div className="welcome-orbit-core"><Sparkles size={30}/></div><span>DRIPXEL / STUDIO</span></div>
        </div>
        <div className="stats">
          <div className="stat-card"><div><small>PUBLISHED PROJECTS</small><FolderKanban/></div><b>{projects.filter(p=>p.published).length.toString().padStart(2,"0")}</b><p>Visible in your portfolio</p></div>
          <div className="stat-card"><div><small>IN PROGRESS</small><Clock3/></div><b>{projects.filter(p=>!p.published).length.toString().padStart(2,"0")}</b><p>Projects in your drafts</p></div>
          <div className="stat-card"><div><small>CREATOR PROGRAMS</small><Award/></div><b>{programs.length.toString().padStart(2,"0")}</b><p>Programs and partnerships</p></div>
          <div className="stat-card"><div><small>TOTAL MESSAGES</small><Mail/></div><b>{messages.length.toString().padStart(2,"0")}</b><p>{unread} awaiting your reply</p></div>
        </div>
        <div className="overview-grid">
          <div className="panel recent-panel">
            <div className="panel-heading"><div><small>YOUR PORTFOLIO</small><h2>Recent projects</h2></div><button onClick={()=>setTab("Projects")}>MANAGE PROJECTS <ArrowUpRight size={14}/></button></div>
            {projects.slice(0,5).map((p,i)=><div className="recent-project" key={p.id}><div className="recent-thumb"><Art project={p} index={i}/></div><div className="recent-copy"><b>{p.title}</b><small>{p.category} · {p.year}</small></div><span className={p.published?"status-published":"status-draft"}>{p.published?"PUBLISHED":"DRAFT"}</span><button aria-label={`Edit ${p.title}`} onClick={()=>{setEditing(p);setEditor(true);}}><ArrowUpRight size={15}/></button></div>)}
            {!projects.length&&<div className="dashboard-empty"><FolderKanban/><h3>Your portfolio starts here.</h3><p>Add your first project to begin building your public body of work.</p><button className="primary" onClick={()=>{setEditing(null);setEditor(true);}}>CREATE FIRST PROJECT <Plus size={16}/></button></div>}
          </div>
          <div className="panel studio-pulse">
            <div className="panel-heading"><div><small>STUDIO ACTIVITY</small><h2>Studio pulse</h2></div><span className="pulse-live"><i/> LIVE</span></div>
            <div className="pulse-row"><span>Creator programs</span><b>{programs.length.toString().padStart(2,"0")}</b></div>
            <div className="pulse-row"><span>Unread messages</span><b>{unread.toString().padStart(2,"0")}</b></div>
            <div className="pulse-row"><span>Published work</span><b>{projects.filter(p=>p.published).length.toString().padStart(2,"0")}</b></div>
            <div className="quick-actions"><small>QUICK ACTIONS</small><button onClick={()=>{setEditing(null);setEditor(true);}}><Plus size={15}/> New project <ArrowUpRight size={14}/></button><button onClick={()=>setTab("Content")}><Settings2 size={15}/> Edit website content <ArrowUpRight size={14}/></button><button onClick={()=>setTab("Media")}><ImageIcon size={15}/> Open media library <ArrowUpRight size={14}/></button></div>
          </div>
        </div>
      </section>}

      {tab==="Projects"&&<section className="projects-admin-section">
        <div className="admin-title"><div><small>PORTFOLIO MANAGEMENT / {projects.length.toString().padStart(2,"0")} ITEMS</small><h1>Projects<span>.</span></h1><p>Shape the stories, experiments and visual worlds people see.</p></div><button className="primary" onClick={()=>{setEditing(null);setEditor(true);}}>NEW PROJECT <Plus/></button></div>
        {projects.length>0?<div className="project-admin-grid">
          {projects.map((p,i)=><article className="project-admin-card" key={p.id}>
            <div className="project-admin-visual"><Art project={p} index={i}/><span className={p.published?"project-status published":"project-status draft"}>{p.published?"LIVE":"DRAFT"}</span><span className="project-visual-index">DX / {String(i+1).padStart(2,"0")}</span></div>
            <div className="project-admin-copy"><div className="project-admin-meta"><small>{p.category} · {p.year}</small>{p.featured&&<span>✳ FEATURED</span>}</div><h3>{p.title}</h3><p>{p.summary||"Add a short project summary."}</p>
              <div className="project-admin-actions"><button onClick={()=>{setEditing(p);setEditor(true);}}>EDIT PROJECT <ArrowUpRight size={14}/></button><button className="danger-text" onClick={()=>void deleteProject(p)}><Trash2 size={14}/> DELETE</button></div>
            </div>
          </article>)}
        </div>:<div className="empty-admin project-empty"><div className="empty-orbit"><FolderKanban size={28}/></div><small>YOUR NEXT CHAPTER STARTS HERE</small><h2>No projects yet.</h2><p>Upload a cover, add a story and publish your first creative project. Your work will appear in the Selected Work section of the public website.</p><button className="primary" onClick={()=>{setEditing(null);setEditor(true);}}>CREATE YOUR FIRST PROJECT <Plus/></button></div>}
      </section>}

      {tab==="Creator Programs"&&<section>
        <div className="admin-title"><div><small>PARTNERSHIPS / MEMBERSHIPS / RECOGNITION</small><h1>Creator programs.</h1><p>Manage ambassador roles, creator memberships, collaborations and program features.</p></div><button className="primary" onClick={()=>{setEditingProgram(null);setProgramEditor(true);}}>ADD PROGRAM <Plus/></button></div>
        <div className="program-admin-grid">
          {programs.map(p=><article className="program-admin-card" key={p.id}>
            <div className="program-admin-image">{p.image_url?<img src={p.image_url} alt={p.name}/>:<Award/>}</div>
            <div className="program-admin-body"><div className="program-admin-meta"><span>{p.role}{p.featured?" · FEATURED":""}</span><span className={p.published?"published":"draft"}>{p.published?"PUBLISHED":"DRAFT"}</span></div>
              <h3>{p.name}</h3><p className="program-org">{p.organization}</p><p>{p.description}</p>
              {p.program_url&&<a href={p.program_url} target="_blank" rel="noreferrer">OPEN PROGRAM LINK <ExternalLink size={13}/></a>}
              <div className="program-admin-actions">
                <button onClick={()=>{setEditingProgram(p);setProgramEditor(true);}}>EDIT</button>
                <button onClick={()=>void toggleProgramPublished(p)}>{p.published?<EyeOff size={14}/>:<Eye size={14}/>} {p.published?"UNPUBLISH":"PUBLISH"}</button>
                <button className="danger-text" onClick={()=>void deleteProgram(p)}><Trash2 size={14}/> DELETE</button>
              </div>
            </div>
          </article>)}
        </div>
        {!programs.length&&<div className="empty-admin"><Award/><h3>No creator programs yet.</h3><p>Add an ambassador program, creator membership, partnership or recognition to display it on your website.</p><button className="primary" onClick={()=>{setEditingProgram(null);setProgramEditor(true);}}>ADD YOUR FIRST PROGRAM <Plus/></button></div>}
      </section>}

      {tab==="Content"&&<section>
        <small>FULL WEBSITE CONTENT MANAGEMENT</small><h1>Website content.</h1><p>Edit each public section independently. Changes are saved to Supabase and appear on the live website.</p>
        <div className="content-layout">
          <nav className="content-groups">{contentGroups.map(g=><button type="button" key={g} className={contentGroup===g?"active":""} onClick={()=>setContentGroup(g)}>{g}</button>)}</nav>
          <form className="content-editor panel" onSubmit={saveContent}>
            <div className="content-editor-heading"><div><small>EDITING SECTION</small><h2>{contentGroup}</h2></div><span>DRIPXEL / CMS</span></div>

            {contentGroup==="Navigation"&&<div className="content-fields">
              {textField("logoText","Brand / logo text")}
              {textField("headerNote","Header note")}
              {textField("navWork","Work menu label")}
              {textField("navAbout","About menu label")}
              {textField("navCapabilities","Capabilities menu label")}
              {textField("navPrograms","Programs menu label")}
              {textField("navCta","Navigation CTA label")}
            </div>}

            {contentGroup==="Hero"&&<div className="content-fields">
              {textField("heroEyebrow","Hero eyebrow")}
              {textField("heroTitle","Hero headline (use a new line for line two)",true)}
              {textField("heroDescription","Hero description",true)}
              {textField("availabilityLabel","Availability / status label")}
              {textField("heroStampOne","Left visual stamp (use new lines)",true)}
              {textField("heroStampTwo","Right visual stamp (use new lines)",true)}
              {textField("heroArtCaption","Hero artwork caption")}
              {textField("heroFootnote","Hero footer statement")}
              <label className="cms-field full">Ticker items (one item per line)<textarea rows={5} value={content.tickerItems.join("\n")} onChange={e=>setContent(c=>({...c,tickerItems:e.target.value.split("\n").map(v=>v.trim()).filter(Boolean)}))}/></label>
            </div>}

            {contentGroup==="Work"&&<div className="content-fields">
              {textField("workEyebrow","Section eyebrow")}
              {textField("workKickerRight","Right-side kicker")}
              {textField("workTitle","Heading first line")}
              {textField("workAccentTitle","Heading accent line")}
              {textField("workDescription","Section description",true)}
            </div>}

            {contentGroup==="About"&&<div className="content-fields">
              {textField("aboutEyebrow","Section eyebrow")}
              {textField("aboutKickerRight","Right-side kicker")}
              {textField("aboutEyebrowSmall","Small intro label")}
              {textField("aboutTitle","About headline",true)}
              {textField("aboutBody","Main biography",true)}
              {textField("aboutExtra","Additional biography paragraph",true)}
              {textField("aboutImageAlt","About image alt text")}
              <label className="cms-field full">About image URL<input value={content.aboutImageUrl} onChange={e=>updateText("aboutImageUrl",e.target.value)} placeholder="Upload an image below or paste a URL"/></label>
              <label className="primary upload cms-upload">UPLOAD ABOUT IMAGE <Plus/><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;setBusy(true);try{const url=await upload(f,"general");updateText("aboutImageUrl",url);setNotice("About image uploaded. Save website content to publish it.");}catch(err){setNotice(err instanceof Error?err.message:"Image upload failed.");}setBusy(false);e.target.value="";}}/></label>
              {content.aboutImageUrl&&<img className="cms-image-preview" src={content.aboutImageUrl} alt="About preview"/>}
              {textField("aboutLinkText","About link label")}
            </div>}

            {contentGroup==="Capabilities"&&<div className="content-fields">
              {textField("capabilitiesEyebrow","Section eyebrow")}
              {textField("capabilitiesKickerRight","Right-side kicker")}
              {textField("capabilitiesTitle","Heading first line")}
              {textField("capabilitiesAccentTitle","Heading accent line")}
              {textField("capabilitiesDescription","Section description",true)}
              <div className="repeat-list full"><div className="repeat-heading"><b>Capability items</b><button type="button" onClick={()=>setContent(c=>({...c,capabilities:[...c.capabilities,{title:"New capability",description:"Add a short description."}]}))}><Plus size={14}/> ADD ITEM</button></div>
                {content.capabilities.map((item,i)=><div className="repeat-card" key={i}><small>CAPABILITY {String(i+1).padStart(2,"0")}</small><input aria-label="Capability title" value={item.title} onChange={e=>setContent(c=>({...c,capabilities:c.capabilities.map((v,j)=>j===i?{...v,title:e.target.value}:v)}))}/><textarea aria-label="Capability description" rows={2} value={item.description} onChange={e=>setContent(c=>({...c,capabilities:c.capabilities.map((v,j)=>j===i?{...v,description:e.target.value}:v)}))}/><button type="button" className="remove-item" onClick={()=>setContent(c=>({...c,capabilities:c.capabilities.filter((_,j)=>j!==i)}))}><Trash2 size={13}/> REMOVE</button></div>)}
              </div>
            </div>}

            {contentGroup==="Programs"&&<div className="content-fields">
              {textField("programsEyebrow","Section eyebrow")}
              {textField("programsTitle","Section headline",true)}
              {textField("programsDescription","Section description",true)}
              <div className="cms-help full"><Award/><p>Program cards and their public visibility are managed in the separate <b>Creator Programs</b> tab. Only published programs appear on the public website.</p></div>
            </div>}

            {contentGroup==="Contact"&&<div className="content-fields">
              {textField("contactEyebrow","Section eyebrow")}
              {textField("contactKickerRight","Right-side kicker")}
              {textField("contactMicrocopy","Small intro line")}
              {textField("contactTitle","Contact headline",true)}
              {textField("contactDescription","Contact description",true)}
              {textField("contactEmail","Public contact email")}
              {textField("contactButtonText","Form submit button label")}
            </div>}

            {contentGroup==="Footer"&&<div className="content-fields">
              {textField("footerDescription","Footer description",true)}
              {textField("footerBottomText","Copyright line (use {year} for current year)")}
              {textField("footerTagline","Footer tagline")}
            </div>}

            {contentGroup==="Social"&&<div className="content-fields">
              {textField("xUrl","X / Twitter URL")}
              {textField("telegramUrl","Telegram URL")}
              <div className="cms-help full"><Mail/><p>The footer's Mail button uses the public contact email configured in the Contact section.</p></div>
              {textField("instagramUrl","Instagram URL")}
              {textField("youtubeUrl","YouTube URL")}
              {textField("tiktokUrl","TikTok URL")}
              {textField("behanceUrl","Behance URL")}
              {textField("linkedinUrl","LinkedIn URL")}
            </div>}

            <div className="content-savebar"><span>Changes are not public until saved.</span><button className="primary" disabled={busy}>{busy?"SAVING…":"SAVE SECTION"} <Check/></button></div>
          </form>
        </div>
      </section>}

      {tab==="Media"&&<section><small>CLOUD MEDIA LIBRARY</small><h1>Your assets.</h1><p>Upload image or video files to persistent Supabase Storage.</p><label className="primary upload">UPLOAD MEDIA <Plus/><input hidden multiple type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={async e=>{if(!e.target.files)return;setBusy(true);try{for(const f of Array.from(e.target.files as FileList))await upload(f,"general");setNotice("Media uploaded.");await loadMedia();}catch(err){setNotice(err instanceof Error?err.message:"Upload failed.");}setBusy(false);e.target.value="";}}/></label>{media.length>0?<div className="media-grid">{media.map((m,i)=><a className="media-card" key={m.name} href={m.url} target="_blank" rel="noreferrer"><div className="media-preview">{/(mp4|webm)$/i.test(m.name)?<video src={m.url} muted playsInline/>:<img src={m.url} alt={m.name} loading="lazy"/>}<span>{String(i+1).padStart(2,"0")}</span></div><b>{m.name}</b><small>OPEN ASSET <ArrowUpRight size={12}/></small></a>)}</div>:<div className="empty-admin media-empty"><ImageIcon/><h3>Your media library is ready.</h3><p>Upload your first image or video. Assets will stay in Supabase Storage and can be reused across your portfolio.</p></div>}</section>}

      {tab==="Inbox"&&<section><small>MESSAGES FROM THE WORLD</small><h1>Inbox.</h1><div className="panel">{messages.map(m=><article className={`message ${m.read?"read":"unread"}`} key={m.id}><div className="message-head"><b>{m.name} · {m.email}</b><small>{m.project_type} / {new Date(m.created_at).toLocaleString()}</small></div><p>{m.message}</p>{!m.read&&<button className="text-action" onClick={async()=>{const {error}=await supabase!.from("contact_messages").update({read:true}).eq("id",m.id);setNotice(error?error.message:"Message marked as read.");await load();}}>MARK AS READ</button>}</article>)}{!messages.length&&<div className="dashboard-empty inbox-empty"><Mail/><h3>Nothing in your inbox.</h3><p>Messages sent through the public contact form will appear here.</p></div>}</div></section>}
    </main>
    {editor&&<ProjectEditor project={editing} close={()=>setEditor(false)} save={saveProject} upload={upload} busy={busy}/>}
    {programEditor&&<CreatorProgramEditor program={editingProgram} close={()=>setProgramEditor(false)} save={saveProgram} upload={upload} busy={busy}/>}
  </div>;
}

function ProjectEditor({project,close,save,upload,busy}:{project:Project|null;close:()=>void;save:(p:Partial<Project>)=>Promise<void>;upload:(f:File,folder:string)=>Promise<string>;busy:boolean}){
  const [data,setData]=useState<Partial<Project>>(project||{title:"",category:categories[0],summary:"",description:"",year:"2026",cover_url:null,video_url:null,gallery_urls:[],published:false,featured:false,sort_order:99});
  const [uploading,setUploading]=useState(false),[error,setError]=useState("");
  async function put(file:File|undefined,key:"cover_url"|"video_url"){
    if(!file)return;setUploading(true);
    try{const url=await upload(file,`projects/${data.id||"new"}`);setData(d=>({...d,[key]:url}));}
    catch(e){setError(e instanceof Error?e.message:"Upload failed");}
    setUploading(false);
  }
  return <div className="editor-back"><form className="editor" onSubmit={e=>{e.preventDefault();void save(data);}}>
    <div className="editor-head"><h2>{project?"Edit project":"New project"}</h2><button type="button" onClick={close}>×</button></div>
    <label>Title<input required value={data.title||""} onChange={e=>setData({...data,title:e.target.value})}/></label>
    <label>Category<select value={data.category||categories[0]} onChange={e=>setData({...data,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Summary<input required value={data.summary||""} onChange={e=>setData({...data,summary:e.target.value})}/></label>
    <label>Description<textarea rows={4} value={data.description||""} onChange={e=>setData({...data,description:e.target.value})}/></label>
    <label>Year<input value={data.year||""} onChange={e=>setData({...data,year:e.target.value})}/></label>
    <label>Sort order<input type="number" value={data.sort_order??99} onChange={e=>setData({...data,sort_order:Number(e.target.value)})}/></label>
    <label>Cover image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void put(e.target.files?.[0],"cover_url")}/></label>
    {data.cover_url&&<img className="upload-preview" src={data.cover_url} alt="Cover preview"/>}
    <label>Video<input type="file" accept="video/mp4,video/webm" onChange={e=>void put(e.target.files?.[0],"video_url")}/></label>
    {data.video_url&&<video className="upload-preview" src={data.video_url} controls/>}
    <label className="check"><input type="checkbox" checked={!!data.published} onChange={e=>setData({...data,published:e.target.checked})}/> Publish project</label>
    <label className="check"><input type="checkbox" checked={!!data.featured} onChange={e=>setData({...data,featured:e.target.checked})}/> Feature project</label>
    {error&&<p className="error">{error}</p>}
    <button className="primary" disabled={busy||uploading}>{busy?"SAVING…":uploading?"UPLOADING…":"SAVE PROJECT"} <Check/></button>
  </form></div>;
}

function CreatorProgramEditor({program,close,save,upload,busy}:{program:CreatorProgram|null;close:()=>void;save:(p:Partial<CreatorProgram>)=>Promise<void>;upload:(f:File,folder:string)=>Promise<string>;busy:boolean}){
  const [data,setData]=useState<Partial<CreatorProgram>>(program||{
    name:"",organization:"",role:"Creator",description:"",image_url:null,program_url:"",
    status:"Active",start_date:"",end_date:"",published:false,featured:false,sort_order:99
  });
  const [uploading,setUploading]=useState(false),[error,setError]=useState("");
  async function put(file:File|undefined){
    if(!file)return;setUploading(true);
    try{const url=await upload(file,`programs/${data.id||"new"}`);setData(d=>({...d,image_url:url}));}
    catch(e){setError(e instanceof Error?e.message:"Image upload failed");}
    setUploading(false);
  }
  return <div className="editor-back"><form className="editor program-editor" onSubmit={e=>{e.preventDefault();void save(data);}}>
    <div className="editor-head"><div><small>CREATOR RELATIONSHIP / PUBLIC PROFILE</small><h2>{program?"Edit creator program":"Add creator program"}</h2></div><button type="button" onClick={close}>×</button></div>
    <label>Program name<input required value={data.name||""} onChange={e=>setData({...data,name:e.target.value})} placeholder="e.g. Creator Program"/></label>
    <label>Organization / platform<input value={data.organization||""} onChange={e=>setData({...data,organization:e.target.value})} placeholder="e.g. Platform or company name"/></label>
    <label>Role / membership type<input value={data.role||""} onChange={e=>setData({...data,role:e.target.value})} placeholder="e.g. Ambassador, Creator, Partner"/></label>
    <label>Description<textarea rows={4} value={data.description||""} onChange={e=>setData({...data,description:e.target.value})} placeholder="Describe the program or your participation."/></label>
    <label>Official program URL<input type="url" value={data.program_url||""} onChange={e=>setData({...data,program_url:e.target.value})} placeholder="https://"/></label>
    <label>Program status<select value={data.status||"Active"} onChange={e=>setData({...data,status:e.target.value})}><option>Active</option><option>Completed</option><option>Alumni</option><option>Invited</option><option>On hold</option></select></label>
    <div className="editor-two"><label>Start date<input type="text" value={data.start_date||""} onChange={e=>setData({...data,start_date:e.target.value})} placeholder="e.g. Oct 2026"/></label><label>End date<input type="text" value={data.end_date||""} onChange={e=>setData({...data,end_date:e.target.value})} placeholder="Optional"/></label></div>
    <label>Display order<input type="number" value={data.sort_order??99} onChange={e=>setData({...data,sort_order:Number(e.target.value)})}/></label>
    <label>Program logo / image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void put(e.target.files?.[0])}/></label>
    {data.image_url&&<img className="upload-preview" src={data.image_url} alt="Program image preview"/>}
    <label className="check"><input type="checkbox" checked={!!data.published} onChange={e=>setData({...data,published:e.target.checked})}/> Publish on public website</label>
    <label className="check"><input type="checkbox" checked={!!data.featured} onChange={e=>setData({...data,featured:e.target.checked})}/> Mark as featured</label>
    {error&&<p className="error">{error}</p>}
    <p className="editor-note">Draft programs remain private. Published programs appear in the Creator Programs section of the public portfolio.</p>
    <button className="primary" disabled={busy||uploading}>{busy?"SAVING…":uploading?"UPLOADING…":"SAVE CREATOR PROGRAM"} <Check/></button>
  </form></div>;
}

export default function App(){
  return window.location.pathname.replace(/\/+$/,"")==="/studio"?<Studio/>:<Portfolio/>;
}
