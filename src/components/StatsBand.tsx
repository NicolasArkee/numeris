const stats = [
  { num: "500+", label: "Clients accompagnés" },
  { num: "28", label: "Années d'expérience" },
  { num: "15", label: "Collaborateurs experts" },
  { num: "98%", label: "Taux de fidélisation" },
];

export function StatsBand() {
  return (
    <section className="border-b border-pierre-12 bg-blanc">
      <div className="mx-auto grid max-w-[82rem] grid-cols-2 gap-0 px-6 py-12 lg:grid-cols-4 lg:px-[4.5rem]">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-2 py-2 text-center lg:px-10 ${i < stats.length - 1 ? "lg:border-r lg:border-pierre-12" : ""} ${i === 0 ? "lg:text-left" : ""}`}
          >
            <span className="block font-serif text-[3rem] font-light italic leading-none text-or">
              {stat.num}
            </span>
            <span className="mt-1 text-[0.78rem] text-ardoise">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
