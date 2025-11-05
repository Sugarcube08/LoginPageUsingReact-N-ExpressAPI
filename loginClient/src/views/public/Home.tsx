import LoginButton from "../../components/LoginButton";
import SignupButton from "../../components/SignupButton";

const highlights = [
  "Secure authentication flows out of the box",
  "Responsive UI tailored for modern teams",
  "Quick access to login and signup journeys"
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
              Welcome to your login & signup workspace
            </h1>
            <p className="text-base text-slate-200/80 sm:text-lg">
              A minimal starting point for building robust access flows. Customize the forms, hook into your backend, and deliver a seamless onboarding experience for your users.
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
              Need a reminder? Update the authentication routes in <code className="rounded bg-slate-900/80 px-1 text-emerald-200">src/views/auth</code> to point to your backend APIs.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
