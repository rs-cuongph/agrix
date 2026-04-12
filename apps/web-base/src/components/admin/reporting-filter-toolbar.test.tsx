import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportingFilterToolbar } from "./reporting-filter-toolbar";

describe("ReportingFilterToolbar", () => {
  it("emits updated dates and refresh events", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onRefresh = jest.fn();

    render(
      <ReportingFilterToolbar
        filter={{
          granularity: "day",
          from: "2026-04-01",
          to: "2026-04-12",
        }}
        onChange={onChange}
        onRefresh={onRefresh}
      />,
    );

    const inputs = screen.getAllByDisplayValue(/2026-04-/);
    fireEvent.change(inputs[0], { target: { value: "2026-04-05" } });
    expect(onChange).toHaveBeenLastCalledWith({
      granularity: "day",
      from: "2026-04-05",
      to: "2026-04-12",
    });

    await user.click(screen.getByRole("button", { name: /lam moi/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
