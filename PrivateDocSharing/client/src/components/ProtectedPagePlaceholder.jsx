function ProtectedPagePlaceholder({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-glow sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100/80">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

export default ProtectedPagePlaceholder;
