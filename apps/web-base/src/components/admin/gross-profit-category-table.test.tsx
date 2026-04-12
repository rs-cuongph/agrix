import { render, screen } from "@testing-library/react";
import { GrossProfitCategoryTable } from "./gross-profit-category-table";

describe("GrossProfitCategoryTable", () => {
  it("renders incomplete cost markers", () => {
    render(
      <GrossProfitCategoryTable
        items={[
          {
            categoryId: "c-1",
            categoryName: "Phan bon",
            revenue: 300000,
            costOfGoodsSold: 120000,
            grossProfit: 180000,
            hasIncompleteCostData: true,
            missingCostOrderCount: 1,
          },
        ]}
      />,
    );

    expect(screen.getByText("Phan bon")).toBeInTheDocument();
    expect(screen.getByText("Thiếu giá vốn")).toBeInTheDocument();
    expect(screen.getByText("180.000đ")).toBeInTheDocument();
  });
});
