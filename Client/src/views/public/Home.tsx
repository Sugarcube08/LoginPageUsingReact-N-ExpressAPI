import LoginButton from "../../components/LoginButton";
import SignupButton from "../../components/SignupButton";
import { Layers3, NotebookPen, PenTool } from "lucide-react";

const highlights = [
  "Organise notebooks, sections, and pages in a single hierarchy",
  "A4 canvas with draggable, resizable content blocks",
  "Autosaving editor ready for realtime upgrades"
];

const featureCards = [
  {
    title: "Hierarchical workspace",
    description: "Group knowledge by notebook, section, and page with instant rename + delete flows.",
    icon: Layers3
  },
  {
    title: "Freeform editor",
    description: "Double-click anywhere on the A4 sheet to create blocks and drag them into spatial layouts.",
    icon: PenTool
  },
  {
    title: "Secure foundation",
    description: "JWT-authenticated API with bcrypt hashing keeps every note scoped to its owner.",
    icon: NotebookPen
  }
];

const Home = () => {
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-emerald-400/15 blur-[140px]" />
        <div className="absolute bottom-[-6rem] left-[-4rem] h-[20rem] w-[20rem] rounded-full bg-sky-400/15 blur-[160px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 text-slate-100">
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-400/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-emerald-200">
            Authentication Suite
          </span>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-white sm:text-[2.3rem]">
              Welcome to Notux One — your spatial notebook hub
            </h1>
            <p className="text-base text-slate-200/80 sm:text-lg">
              Launch immersive notebooks where every page is an A4 canvas. Structure content with sections, personalise layouts with draggable blocks, and keep teams aligned with a secure auth layer.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-slate-200/80 sm:text-base">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.7)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-[24px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_40px_120px_-70px_rgba(8,47,73,0.9)] backdrop-blur sm:p-9">
          <div className="absolute -top-10 right-12 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-0 rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-950/70 via-slate-900/65 to-slate-800/75" />
          <div className="relative space-y-5">
            <div className="space-y-2 text-center text-slate-200">
              <h2 className="text-2xl font-semibold text-white">Get started</h2>
              <p className="text-sm text-slate-300/80">
                Choose an action to explore the demo flows.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <LoginButton />
              <SignupButton />
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              Ready to build? Start by wiring the Express notebook routes to your datastore and customise the editor blocks to suit your workflow.
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-16 grid w-full max-w-5xl gap-6 sm:grid-cols-3">
        {featureCards.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_90px_-60px_rgba(8,47,73,0.85)] backdrop-blur transition-transform hover:-translate-y-1 hover:shadow-[0_40px_120px_-70px_rgba(16,185,129,0.35)]"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200/75">
              {description}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
