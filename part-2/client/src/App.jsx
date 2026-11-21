import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import api, { getErrorMessage } from "./services/api.js";
import { useAuth } from "./context/AuthContext.jsx";

const EMPTY_EMPLOYEE = {
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  salary: "",
  status: "Active",
  joiningDate: new Date().toISOString().slice(0, 10),
};

const departments = ["Engineering", "Design", "Marketing", "People", "Finance", "Operations", "Sales"];

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function App() {
  const { user, loading, login, register, logout } = useAuth();
  const [authMode, setAuthMode] = useState("login");

  if (loading) {
    return <div className="loading-screen"><span className="loading-mark">g.</span><span>Getting your workspace ready</span></div>;
  }

  if (!user) {
    return <AuthScreen mode={authMode} setMode={setAuthMode} login={login} register={register} />;
  }

  return <Dashboard user={user} logout={logout} />;
}

function AuthScreen({ mode, setMode, login, register }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await (isRegister ? register(form) : login({ email: form.email, password: form.password }));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-aside">
        <div className="brand"><span className="brand-mark">g.</span><span>greenboard</span></div>
        <div className="aside-copy">
          <div className="eyebrow"><span className="pulse-dot" /> PEOPLE, IN GOOD COMPANY</div>
          <h1>Better work<br />starts <em>together.</em></h1>
          <p>One thoughtful space to support the people who make your business.</p>
        </div>
        <div className="aside-bottom">
          <div className="avatar-stack"><span>AM</span><span>JR</span><span>SK</span><b>+</b></div>
          <span>Made for teams that care.</span>
          <span className="aside-version">EST. 2024</span>
        </div>
        <div className="aside-decoration" aria-hidden="true">g</div>
      </section>
      <section className="auth-main">
        <div className="auth-topline"><span>YOUR PEOPLE, IN SYNC</span><span>01 — 02</span></div>
        <div className="auth-form-wrap">
          <div className="auth-icon"><ShieldCheck size={19} /></div>
          <div className="eyebrow auth-eyebrow">{isRegister ? "A GOOD PLACE TO BEGIN" : "WELCOME BACK"}</div>
          <h2>{isRegister ? "Build your workspace." : "Good to see you."}</h2>
          <p className="auth-subtitle">{isRegister ? "Set up your account and bring your team together." : "Sign in to pick up where your team left off."}</p>
          <form className="auth-form" onSubmit={submit}>
            {isRegister && (
              <label>
                Your name
                <input autoComplete="name" required minLength={2} maxLength={80} placeholder="e.g. Alex Morgan" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            )}
            <label>
              Work email
              <input type="email" autoComplete="email" required maxLength={254} placeholder="you@company.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label>
              Password
              <input type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : 1} maxLength={72} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </label>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="button button-primary auth-submit" disabled={busy}>
              {busy ? "One moment…" : isRegister ? "Create workspace" : "Sign in"} <ArrowRight size={17} />
            </button>
          </form>
          <div className="auth-switch">
            {isRegister ? "Already have a workspace?" : "New to Greenboard?"}
            <button type="button" onClick={() => { setError(""); setMode(isRegister ? "login" : "register"); }}>
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </div>
          <div className="auth-footnote"><ShieldCheck size={14} /> Your team data is private and secure.</div>
        </div>
        <div className="auth-footer"><span>© 2025 GREENBOARD</span><span>BUILT FOR PEOPLE</span></div>
      </section>
    </main>
  );
}

function Dashboard({ user, logout }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  async function loadEmployees() {
    setLoadError("");
    try {
      const { data } = await api.get("/employees");
      setEmployees(data.employees);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEmployees(); }, []);

  const departmentOptions = useMemo(
    () => ["All departments", ...new Set([...departments, ...employees.map((employee) => employee.department)])],
    [employees],
  );
  const filtered = useMemo(() => employees.filter((employee) => {
    const matchesDepartment = department === "All departments" || employee.department === department;
    const needle = search.toLowerCase().trim();
    const matchesSearch = !needle || [employee.name, employee.email, employee.position].some((value) => value.toLowerCase().includes(needle));
    return matchesDepartment && matchesSearch;
  }), [employees, department, search]);
  const activeCount = employees.filter((employee) => employee.status === "Active").length;
  const departmentsCount = new Set(employees.map((employee) => employee.department)).size;
  const payroll = employees.reduce((total, employee) => total + employee.salary, 0);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  async function saveEmployee(values) {
    if (modal.employee) {
      const { data } = await api.patch(`/employees/${modal.employee._id}`, values);
      setEmployees((current) => current.map((employee) => employee._id === data.employee._id ? data.employee : employee));
      showToast("Employee details updated");
    } else {
      const { data } = await api.post("/employees", values);
      setEmployees((current) => [data.employee, ...current]);
      showToast("Employee added to your team");
    }
    setModal(null);
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Remove ${employee.name} from your team? This cannot be undone.`)) return;
    try {
      await api.delete(`/employees/${employee._id}`);
      setEmployees((current) => current.filter((item) => item._id !== employee._id));
      showToast(`${employee.name} has been removed`);
    } catch (error) {
      showToast(getErrorMessage(error));
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><span className="brand-mark">g.</span><span>greenboard</span><button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button></div>
        <div className="workspace-select"><div className="workspace-symbol">W</div><div><strong>Workspace</strong><small>People & culture</small></div><ChevronDown size={15} /></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav">
          <a className="nav-item active" href="#team"><LayoutDashboard size={17} /> Overview</a>
          <a className="nav-item" href="#team"><Users size={17} /> Team <span className="nav-count">{employees.length}</span></a>
          <a className="nav-item" href="#team"><Building2 size={17} /> Departments</a>
        </nav>
        <div className="nav-label nav-label-spaced">YOUR SPACE</div>
        <nav className="main-nav">
          <a className="nav-item" href="#team"><Clock3 size={17} /> Time off</a>
          <a className="nav-item" href="#team"><Settings size={17} /> Settings</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><strong>Need a hand?</strong><p>We’re here to help you get settled.</p><button onClick={() => showToast("Help center coming soon")}>Visit help center <ArrowRight size={13} /></button></div>
          <button className="profile-button" onClick={logout}>
            <span className="profile-avatar">{initials(user.name)}</span><span className="profile-info"><strong>{user.name}</strong><small>{user.email}</small></span><LogOut size={16} className="logout-icon" />
          </button>
        </div>
      </aside>
      {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={19} /></button><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-right"><span className="today-label">YOUR TEAM, AT A GLANCE</span><span className="topbar-avatar">{initials(user.name)}</span></div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="pulse-dot" /> MONDAY, YOUR WAY</div><h1>A little more <em>in sync.</em></h1><p>Here’s the shape of your team today, {user.name.split(" ")[0]}.</p></div>
            <button className="button button-primary add-button" onClick={() => setModal({ employee: null })}><Plus size={17} /> Add team member</button>
          </section>

          <section className="stat-grid" aria-label="Team summary">
            <StatCard label="Total team" value={employees.length} detail="People on your roster" icon={Users} tone="green" />
            <StatCard label="Active today" value={activeCount} detail={employees.length ? `${Math.round((activeCount / employees.length) * 100)}% of your team` : "Ready when you are"} icon={Check} tone="lime" />
            <StatCard label="Departments" value={departmentsCount} detail="Across your workspace" icon={Building2} tone="purple" />
            <StatCard label="Annual payroll" value={currency(payroll)} detail="Combined annual salaries" icon={DollarSign} tone="orange" />
          </section>

          <section className="team-panel" id="team">
            <div className="panel-heading">
              <div><div className="panel-title-row"><h2>Your people</h2><span className="count-pill">{employees.length} {employees.length === 1 ? "person" : "people"}</span></div><p>A good team is built one person at a time.</p></div>
              <button className="button button-outline" onClick={() => setModal({ employee: null })}><Plus size={16} /> Add person</button>
            </div>
            <div className="table-toolbar">
              <label className="search-box"><Search size={16} /><input placeholder="Search people, roles..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
              <label className="department-filter"><Building2 size={15} /><select value={department} onChange={(event) => setDepartment(event.target.value)}>{departmentOptions.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
              <button className="filter-button" onClick={() => { setSearch(""); setDepartment("All departments"); }}><ArrowDownUp size={15} /><span>Reset</span></button>
            </div>
            {loadError && <div className="inline-error" role="alert">{loadError} <button onClick={loadEmployees}>Try again</button></div>}
            <div className="table-wrap">
              <table>
                <thead><tr><th>TEAM MEMBER</th><th>ROLE</th><th>DEPARTMENT</th><th>START DATE</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6"><div className="table-empty"><span className="mini-loader" /> Gathering your people…</div></td></tr>
                  ) : filtered.length ? filtered.map((employee, index) => (
                    <tr key={employee._id}>
                      <td><div className="person-cell"><span className={`person-avatar avatar-${index % 5}`}>{initials(employee.name)}</span><span><strong>{employee.name}</strong><small>{employee.email}</small></span></div></td>
                      <td><span className="role-text">{employee.position}</span></td>
                      <td><span className="department-cell"><span className="department-dot" />{employee.department}</span></td>
                      <td className="date-cell">{formatDate(employee.joiningDate)}</td>
                      <td><span className={`status-badge ${employee.status.toLowerCase().replace(" ", "-")}`}><span />{employee.status}</span></td>
                      <td><div className="row-actions"><button title="Edit employee" aria-label={`Edit ${employee.name}`} onClick={() => setModal({ employee })}><Pencil size={15} /></button><button title="Remove employee" aria-label={`Remove ${employee.name}`} onClick={() => deleteEmployee(employee)}><Trash2 size={15} /></button></div></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6"><EmptyState search={search} onAdd={() => setModal({ employee: null })} /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{employees.length}</strong> team members</span><div className="pagination"><button aria-label="Previous page" disabled><ArrowLeft size={15} /></button><span>01</span><button aria-label="Next page" disabled><ArrowRight size={15} /></button></div></div>
          </section>

          <footer className="dashboard-footer"><span>Small teams do great things.</span><span>GREENBOARD <span className="footer-dot">·</span> PEOPLE FIRST</span></footer>
        </div>
      </main>

      {modal && <EmployeeModal employee={modal.employee} onClose={() => setModal(null)} onSave={saveEmployee} />}
      {toast && <div className="toast"><span className="toast-check"><Check size={14} /></span>{toast}</div>}
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone }) {
  return <article className={`stat-card stat-${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={17} /></span></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div><div className="stat-line" /></article>;
}

function EmptyState({ search, onAdd }) {
  return <div className="table-empty empty-state"><span className="empty-icon"><BriefcaseBusiness size={21} /></span><strong>{search ? "No people found" : "Your team story starts here"}</strong><p>{search ? "Try another name, role or email." : "Add your first teammate to make this space yours."}</p>{!search && <button className="text-button" onClick={onAdd}>Add your first person <ArrowRight size={14} /></button>}</div>;
}

function EmployeeModal({ employee, onClose, onSave }) {
  const [form, setForm] = useState(employee ? { ...employee, joiningDate: new Date(employee.joiningDate).toISOString().slice(0, 10) } : EMPTY_EMPLOYEE);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [busy, setBusy] = useState(false);

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter a name with at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!/^[+()\d\s.-]{7,30}$/.test(form.phone)) next.phone = "Enter a valid phone number.";
    if (form.position.trim().length < 2) next.position = "Enter a job title.";
    if (form.department.trim().length < 2) next.department = "Enter a department.";
    if (form.salary === "" || Number(form.salary) < 0 || !Number.isFinite(Number(form.salary))) next.salary = "Enter a salary of zero or more.";
    if (!form.joiningDate) next.joiningDate = "Choose a joining date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setRequestError("");
    if (!validate()) return;
    setBusy(true);
    try {
      await onSave({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), position: form.position.trim(), department: form.department.trim(), salary: Number(form.salary) });
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="employee-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header"><div><div className="eyebrow"><span className="pulse-dot" /> TEAM DIRECTORY</div><h2 id="modal-title">{employee ? "A few updates." : "Meet your new teammate."}</h2><p>{employee ? "Keep their details current." : "The best teams start with knowing each other."}</p></div><button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
        <form className="employee-form" onSubmit={submit} noValidate>
          <div className="form-grid">
            <FormField label="Full name" name="name" value={form.name} error={errors.name} onChange={(value) => setField("name", value)} placeholder="e.g. Jamie Rivera" autoFocus />
            <FormField label="Work email" name="email" type="email" value={form.email} error={errors.email} onChange={(value) => setField("email", value)} placeholder="jamie@company.com" />
            <FormField label="Phone number" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={(value) => setField("phone", value)} placeholder="+1 (555) 000-0000" />
            <FormField label="Job title" name="position" value={form.position} error={errors.position} onChange={(value) => setField("position", value)} placeholder="e.g. Product designer" />
            <label className="form-field">Department<select value={form.department} onChange={(event) => setField("department", event.target.value)}><option value="">Select department</option>{[...new Set([...departments, form.department].filter(Boolean))].map((item) => <option key={item}>{item}</option>)}</select>{errors.department && <small className="field-error">{errors.department}</small>}</label>
            <label className="form-field">Employment status<select value={form.status} onChange={(event) => setField("status", event.target.value)}><option>Active</option><option>On leave</option><option>Inactive</option></select></label>
            <FormField label="Annual salary (USD)" name="salary" type="number" value={form.salary} error={errors.salary} onChange={(value) => setField("salary", value)} placeholder="e.g. 72000" min="0" step="1000" />
            <FormField label="Start date" name="joiningDate" type="date" value={form.joiningDate} error={errors.joiningDate} onChange={(value) => setField("joiningDate", value)} />
          </div>
          {requestError && <div className="form-error" role="alert">{requestError}</div>}
          <div className="modal-footer"><span><ShieldCheck size={14} /> Only your workspace can see this.</span><div><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? "Saving…" : employee ? "Save changes" : "Add to team"} {!busy && <ArrowRight size={15} />}</button></div></div>
        </form>
      </section>
    </div>
  );
}

function FormField({ label, name, value, error, onChange, type = "text", ...props }) {
  return <label className="form-field">{label}<input type={type} name={name} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} {...props} />{error && <small className="field-error">{error}</small>}</label>;
}
