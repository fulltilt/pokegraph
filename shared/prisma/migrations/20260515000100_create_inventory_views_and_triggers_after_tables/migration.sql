-- Create or refresh inventory reporting views and sale trigger after core tables exist.

CREATE OR REPLACE VIEW v_inventory_value AS
SELECT
  p.name,
  p.set_name,
  i.condition,
  i.quantity,
  (i.purchase_price + COALESCE(i.shipping_cost, 0) + COALESCE(i.other_fees, 0)) as total_cost,
  i.status,
  i.location,
  (i.quantity * (i.purchase_price + COALESCE(i.shipping_cost, 0) + COALESCE(i.other_fees, 0))) as total_investment
FROM inventory_items i
JOIN products p ON i.product_id = p.id
WHERE i.status = 'In Stock';

CREATE OR REPLACE VIEW v_sales_performance AS
SELECT
  p.name,
  p.set_name,
  s.sale_date,
  s.sale_price,
  s.quantity_sold,
  (i.purchase_price + COALESCE(i.shipping_cost, 0) + COALESCE(i.other_fees, 0)) as cost_basis,
  s.net_profit,
  s.profit_margin,
  s.platform
FROM sales s
JOIN inventory_items i ON s.inventory_item_id = i.id
JOIN products p ON i.product_id = p.id;

CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT
  p.id as product_id,
  p.upc,
  p.name,
  p.set_name,
  COUNT(i.id) as total_units,
  SUM(i.quantity) as total_quantity,
  SUM(i.quantity * (i.purchase_price + COALESCE(i.shipping_cost, 0) + COALESCE(i.other_fees, 0))) as total_invested,
  AVG(i.purchase_price + COALESCE(i.shipping_cost, 0) + COALESCE(i.other_fees, 0)) as avg_cost_per_unit,
  MIN(i.purchase_date) as first_purchase,
  MAX(i.purchase_date) as last_purchase
FROM products p
LEFT JOIN inventory_items i ON p.id = i.product_id AND i.status = 'In Stock'
GROUP BY p.id, p.upc, p.name, p.set_name;

CREATE OR REPLACE FUNCTION update_inventory_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET status = 'Sold', updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.inventory_item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_on_sale ON sales;
CREATE TRIGGER trigger_update_inventory_on_sale
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status_on_sale();
