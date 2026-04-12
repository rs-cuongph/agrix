import { render, screen } from "@testing-library/react";
import { TopProductsTable } from "./top-products-table";

describe("TopProductsTable", () => {
  it("renders ranked products and revenue values", () => {
    render(
      <TopProductsTable
        items={[
          {
            rank: 1,
            productId: "p-1",
            sku: "SKU-1",
            productName: "Regent 800WG",
            categoryName: "Thuoc tru sau",
            quantitySold: 12,
            revenueContribution: 240000,
          },
        ]}
      />,
    );

    expect(screen.getByText("Regent 800WG")).toBeInTheDocument();
    expect(screen.getByText("SKU-1")).toBeInTheDocument();
    expect(screen.getByText("240.000đ")).toBeInTheDocument();
  });
});
