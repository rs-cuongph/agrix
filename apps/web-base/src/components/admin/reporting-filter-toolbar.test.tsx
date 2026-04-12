import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportingFilterToolbar } from "./reporting-filter-toolbar";

describe("ReportingFilterToolbar", () => {
  it("renders the date range label and refresh button", async () => {
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

    // Date range label should show the formatted range
    expect(screen.getByText(/01\/04\/2026/)).toBeTruthy();
    expect(screen.getByText(/12\/04\/2026/)).toBeTruthy();

    // Clicking refresh should call onRefresh
    await user.click(screen.getByRole("button", { name: /làm mới/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("resets date range when granularity changes", async () => {
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

    // Open the granularity select and pick "Tháng"
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /tháng/i }));

    // onChange should have been called with granularity="month" and reset dates
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ granularity: "month" }),
    );
    const call = onChange.mock.calls[0][0];
    expect(call.from).not.toBe("2026-04-01");
  });
});
