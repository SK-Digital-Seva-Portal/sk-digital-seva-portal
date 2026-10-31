/* SK Digital Seva Portal — frontend starter */
(() => {
  const cfg = window.SK_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("PASTE_") && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  const client = configured ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const $ = id => document.getElementById(id);
  let currentUser = null, profile = null, services = [];
  const categories = ["Aadhaar","PAN Card","RTPS Bihar","Voter ID","Government","Private Services","Banking","Other"];
  const defaults = [
    ["Aadhaar Services","Aadhaar","UIDAI की आधिकारिक सेवाएं","https://uidai.gov.in/","🪪"],
    ["PAN Card","PAN Card","PAN से जुड़ी आधिकारिक सेवाएं","https://www.incometax.gov.in/","▤"],
    ["RTPS Bihar","RTPS Bihar","बिहार लोक सेवाओं के लिए आधिकारिक पोर्टल","https://serviceonline.bihar.gov.in/","🏛"],
    ["Voter Services","Voter ID","मतदाता सेवाओं का आधिकारिक पोर्टल","https://voters.eci.gov.in/","🗳"],
    ["DigiLocker","Government","डिजिटल दस्तावेज़ों के लिए आधिकारिक पोर्टल","https://www.digilocker.gov.in/","📁"],
    ["Passport Seva","Government","पासपोर्ट आवेदन और सेवाएं","https://www.passportindia.gov.in/","🛂"]
  ];
  function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),3200)}
  function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function validUrl(value){try{const u=new URL(value);return u.protocol==="https:"}catch{return false}}
  function switchTab(tab){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));$("loginForm").classList.toggle("hidden",tab!=="login");$("signupForm").classList.toggle("hidden",tab!=="signup")}
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
  function showAuth(){ $("authView").classList.remove("hidden");$("appView").classList.add("hidden") }
  function showApp(){ $("authView").classList.add("hidden");$("appView").classList.remove("hidden"); }
  function setProfileUI(){const name=profile?.full_name||currentUser?.email||"Customer";$("sideName").textContent=name;$("topUser").textContent=name;$("avatar").textContent=name[0].toUpperCase();$("topAvatar").textContent=name[0].toUpperCase();$("sideRole").textContent=(profile?.role||"customer").toUpperCase();document.querySelectorAll(".admin-only").forEach(x=>x.classList.toggle("hidden",profile?.role!=="admin"))}
  async function loadProfile(){const {data,error}=await client.from("profiles").select("*").eq("id",currentUser.id).single();if(error)throw error;profile=data;setProfileUI()}
  async function loadServices(){const {data,error}=await client.from("services").select("*").eq("is_active",true).order("sort_order");if(error)throw error;services=data||[]}
  async function logActivity(action,details={}){try{await client.from("activity_logs").insert({user_id:currentUser.id,action,details})}catch(e){console.warn("Activity log:",e.message)}}
  function serviceCards(list){return list.map(s=>`<article class="service-card"><div class="service-icon">${escapeHtml(s.icon||"✦")}</div><h4>${escapeHtml(s.title)}</h4><p>${escapeHtml(s.description||"Official online service")}</p><a class="open-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" data-service="${s.id}">Open Website ↗</a></article>`).join("")||'<div class="empty">अभी कोई service उपलब्ध नहीं है।</div>'}
  function bindServiceClicks(){document.querySelectorAll("[data-service]").forEach(a=>a.addEventListener("click",()=>logActivity("service_opened",{service_id:a.dataset.service})))}
  function homePage(){const admin=profile.role==="admin",approved=profile.status==="approved"||admin;
    $("pageEyebrow").textContent=admin?"ADMIN WORKSPACE":"YOUR WORKSPACE";$("pageTitle").textContent="Dashboard";
    if(!approved){$("pendingBanner").classList.remove("hidden");$("pageContent").innerHTML=`<div class="panel pending-large"><div class="big-icon">⏳</div><h3>आपका Account Approval Pending है</h3><p>आपका signup सफल रहा है। Admin द्वारा account approve होने के बाद सभी services उपलब्ध हो जाएंगी।<br>कृपया अपने Cyber Cafe Admin से संपर्क करें।</p></div>`;return}
    $("pendingBanner").classList.add("hidden");
    $("pageContent").innerHTML=`<div class="welcome-card"><div><h3>नमस्ते, ${escapeHtml(profile.full_name||"Welcome")} 👋</h3><p>SK Digital Seva Portal पर आपका स्वागत है। अपनी जरूरत की service चुनें।</p></div><div class="welcome-icon">✦</div></div><div class="stats"><div class="stat"><small>Available Services</small><b>${services.length}</b></div><div class="stat"><small>Account Status</small><b style="font-size:17px;color:#16845b">Active</b></div><div class="stat"><small>Account Type</small><b style="font-size:17px">${admin?"Admin":"Customer"}</b></div></div><div class="section-head"><h3>Popular Services</h3><button class="text-button" id="seeAll">View all →</button></div><div class="service-grid">${serviceCards(services.slice(0,6))}</div>`;
    $("seeAll").onclick=()=>navigate("services");bindServiceClicks();
  }
  function servicesPage(){ $("pageEyebrow").textContent="SERVICE DIRECTORY";$("pageTitle").textContent="All Services";
    if(profile.role!=="admin"&&profile.status!=="approved"){$("pendingBanner").classList.remove("hidden");$("pageContent").innerHTML='<div class="panel empty">Admin approval मिलने के बाद services उपलब्ध होंगी।</div>';return}
    $("pendingBanner").classList.add("hidden");$("pageContent").innerHTML=`<div class="toolbar"><input id="serviceSearch" placeholder="Search services..."><select id="categoryFilter"><option value="">All categories</option>${categories.map(c=>`<option>${c}</option>`).join("")}</select></div><div class="service-grid" id="serviceGrid">${serviceCards(services)}</div>`;
    const filter=()=>{const q=$("serviceSearch").value.toLowerCase(),cat=$("categoryFilter").value;const list=services.filter(s=>(!cat||s.category===cat)&&(`${s.title} ${s.description||""}`.toLowerCase().includes(q)));$("serviceGrid").innerHTML=serviceCards(list);bindServiceClicks()};
    $("serviceSearch").oninput=filter;$("categoryFilter").onchange=filter;bindServiceClicks();
  }
  async function customersPage(){ $("pageEyebrow").textContent="ADMIN CONTROL";$("pageTitle").textContent="Customer Approvals";$("pendingBanner").classList.add("hidden");
    $("pageContent").innerHTML='<div class="panel"><h3>Customer Accounts</h3><div class="toolbar"><input id="customerSearch" placeholder="Search by name or email..."></div><div id="customerTable" class="table-wrap"><div class="empty">Loading customers...</div></div></div>';
    const {data,error}=await client.from("profiles").select("id,full_name,email,phone,status,created_at,role").order("created_at",{ascending:false});
    if(error){$("customerTable").innerHTML=`<p class="empty">Customers load नहीं हुए: ${escapeHtml(error.message)}</p>`;return}
    const draw=(q="")=>{const rows=(data||[]).filter(x=>`${x.full_name||""} ${x.email||""}`.toLowerCase().includes(q));$("customerTable").innerHTML=`<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${escapeHtml(x.full_name||"—")}</td><td>${escapeHtml(x.email||"—")}</td><td>${new Date(x.created_at).toLocaleDateString("en-IN")}</td><td><span class="pill ${x.status==="approved"?"active":""}">${escapeHtml(x.status)}</span></td><td>${x.role==="admin"?"Admin":x.status==="approved"?`<button class="action-btn danger" data-block="${x.id}">Block</button>`:`<button class="action-btn" data-approve="${x.id}">Approve</button>`}</td></tr>`).join("")||'<tr><td colspan="5" class="empty">कोई customer नहीं मिला।</td></tr>'}</tbody></table>`;
      document.querySelectorAll("[data-approve]").forEach(b=>b.onclick=()=>updateCustomer(b.dataset.approve,"approved"));document.querySelectorAll("[data-block]").forEach(b=>b.onclick=()=>updateCustomer(b.dataset.block,"blocked"))};
    draw();$("customerSearch").oninput=e=>draw(e.target.value.toLowerCase());
  }
  async function updateCustomer(id,status){const {error}=await client.from("profiles").update({status}).eq("id",id);if(error){toast("Update failed: "+error.message);return}toast(status==="approved"?"Customer approved":"Customer blocked");await customersPage()}
  function managePage(){ $("pageEyebrow").textContent="ADMIN CONTROL";$("pageTitle").textContent="Manage Services";$("pendingBanner").classList.add("hidden");
    $("pageContent").innerHTML=`<div class="panel"><h3>Add a Government / Private Service</h3><form id="serviceForm" class="form-grid"><label>Service Title<input id="sTitle" required maxlength="100" placeholder="e.g. RTPS Bihar"></label><label>Category<select id="sCategory">${categories.map(c=>`<option>${c}</option>`).join("")}</select></label><label class="wide">Official Website URL<input id="sUrl" type="url" required placeholder="https://..."></label><label class="wide">Description<input id="sDesc" maxlength="180" placeholder="इस service के बारे में छोटा विवरण"></label><label>Icon / Emoji<input id="sIcon" maxlength="5" placeholder="🏛"></label><label>Display Order<input id="sOrder" type="number" value="10"></label></div><button class="primary" type="submit">Add Service</button></form></div><div class="section-head"><h3>Current Services</h3></div><div class="panel table-wrap" id="managedServices"></div>`;
    $("serviceForm").onsubmit=async e=>{e.preventDefault();const url=$("sUrl").value.trim();if(!validUrl(url)){toast("केवल valid HTTPS URL जोड़ें");return}const {error}=await client.from("services").insert({title:$("sTitle").value.trim(),category:$("sCategory").value,url,description:$("sDesc").value.trim(),icon:$("sIcon").value.trim()||"✦",sort_order:Number($("sOrder").value)||10,created_by:currentUser.id});if(error){toast("Service add नहीं हुई: "+error.message);return}toast("Service successfully added");await loadServices();managePage()};
    $("managedServices").innerHTML=`<table class="data-table"><thead><tr><th>Service</th><th>Category</th><th>URL</th><th>Action</th></tr></thead><tbody>${services.map(s=>`<tr><td>${escapeHtml(s.title)}</td><td>${escapeHtml(s.category)}</td><td><a class="open-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">Open ↗</a></td><td><button class="action-btn danger" data-delete="${s.id}">Delete</button></td></tr>`).join("")||'<tr><td colspan="4" class="empty">No services yet.</td></tr>'}</tbody></table>`;
    document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{if(!confirm("इस service को delete करें?"))return;const {error}=await client.from("services").delete().eq("id",b.dataset.delete);if(error){toast(error.message);return}await loadServices();managePage();toast("Service deleted")});
  }
  function navigate(page){document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));if(page==="home")homePage();if(page==="services")servicesPage();if(page==="customers"&&profile.role==="admin")customersPage();if(page==="manage"&&profile.role==="admin")managePage()}
  document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
  async function refresh(){if(!client){showAuth();toast("पहले config.js में Supabase URL और Key डालें।");return}const {data:{session}}=await client.auth.getSession();if(!session){showAuth();return}currentUser=session.user;try{await loadProfile();await loadServices();showApp();navigate("home")}catch(e){toast("Portal load error: "+e.message);showAuth()}}
  $("loginForm").onsubmit=async e=>{e.preventDefault();if(!client){toast("Supabase setup बाकी है। README देखें।");return}const {error}=await client.auth.signInWithPassword({email:$("loginEmail").value.trim(),password:$("loginPassword").value});if(error){toast(error.message);return}await refresh()};
  $("signupForm").onsubmit=async e=>{e.preventDefault();if(!client){toast("Supabase setup बाकी है। README देखें।");return}const email=$("signupEmail").value.trim(),full_name=$("signupName").value.trim(),phone=$("signupPhone").value.trim();const {data,error}=await client.auth.signUp({email,password:$("signupPassword").value,options:{data:{full_name,phone}}});if(error){toast(error.message);return}if(data.session){toast("Signup successful. Admin approval का इंतजार करें।");await refresh()}else toast("Signup request भेज दी गई। Email confirmation पूरा करें, फिर Admin approval का इंतजार करें।");e.target.reset()};
  $("logoutBtn").onclick=async()=>{await client.auth.signOut();currentUser=null;profile=null;showAuth();switchTab("login")};
  $("year").textContent=new Date().getFullYear();
  if(!configured){showAuth();toast("Setup: config.js में Supabase URL और Publishable Key डालें।")}else{client.auth.onAuthStateChange(()=>{});refresh()}
})();