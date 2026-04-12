import { buildFilterQuery, getDefaultFilter, getFilterLabel } from "./reporting-filters";

describe("reporting-filters", () => {
  it("creates a valid default day filter", () => {
    const filter = getDefaultFilter("day");

    expect(filter.granularity).toBe("day");
    expect(filter.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(filter.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("serializes filter state into query parameters", () => {
    const query = buildFilterQuery({
      granularity: "month",
      from: "2026-04-01",
      to: "2026-04-30",
    });

    expect(query).toContain("granularity=month");
    expect(query).toContain("from=2026-03-31T17%3A00%3A00.000Z");
    expect(query).toContain("to=2026-04-30T16%3A59%3A59.000Z");
  });

  it("builds a readable filter label", () => {
    expect(
      getFilterLabel({
        granularity: "week",
        from: "2026-04-06",
        to: "2026-04-12",
      }),
    ).toBe("2026-04-06 -> 2026-04-12");
  });
});
