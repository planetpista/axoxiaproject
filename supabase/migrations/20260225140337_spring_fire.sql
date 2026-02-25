/*
  # Create admin utility functions and views

  1. Functions
    - `get_delivery_stats()` - Get delivery statistics
    - `get_financial_summary()` - Get financial summary
    - `assign_courier_to_delivery()` - Assign courier to delivery

  2. Views
    - `delivery_overview` - Complete delivery information with addresses
    - `financial_overview` - Financial records with delivery info
*/

-- Function to get delivery statistics
CREATE OR REPLACE FUNCTION get_delivery_stats(
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  date_filter text := '';
BEGIN
  -- Build date filter if provided
  IF start_date IS NOT NULL AND end_date IS NOT NULL THEN
    date_filter := ' AND created_at BETWEEN ''' || start_date || ''' AND ''' || end_date || '''';
  END IF;

  EXECUTE format('
    SELECT jsonb_build_object(
      ''total_deliveries'', COUNT(*),
      ''pending'', COUNT(*) FILTER (WHERE status = ''pending''),
      ''assigned'', COUNT(*) FILTER (WHERE status = ''assigned''),
      ''in_transit'', COUNT(*) FILTER (WHERE status = ''in_transit''),
      ''delivered'', COUNT(*) FILTER (WHERE status = ''delivered''),
      ''failed'', COUNT(*) FILTER (WHERE status = ''failed''),
      ''cancelled'', COUNT(*) FILTER (WHERE status = ''cancelled''),
      ''total_revenue'', COALESCE(SUM(cost + insurance_cost), 0),
      ''average_weight'', COALESCE(AVG(weight), 0),
      ''total_weight'', COALESCE(SUM(weight), 0)
    )
    FROM deliveries
    WHERE 1=1 %s
  ', date_filter) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get financial summary
CREATE OR REPLACE FUNCTION get_financial_summary(
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  summary jsonb;
  date_filter text := '';
BEGIN
  -- Build date filter if provided
  IF start_date IS NOT NULL AND end_date IS NOT NULL THEN
    date_filter := ' AND created_at BETWEEN ''' || start_date || ''' AND ''' || end_date || '''';
  END IF;

  EXECUTE format('
    SELECT jsonb_build_object(
      ''total_revenue'', COALESCE(SUM(amount) FILTER (WHERE type = ''revenue'' AND payment_status = ''completed''), 0),
      ''total_costs'', COALESCE(SUM(amount) FILTER (WHERE type = ''cost''), 0),
      ''total_refunds'', COALESCE(SUM(amount) FILTER (WHERE type = ''refund''), 0),
      ''pending_payments'', COALESCE(SUM(amount) FILTER (WHERE payment_status = ''pending''), 0),
      ''failed_payments'', COALESCE(SUM(amount) FILTER (WHERE payment_status = ''failed''), 0),
      ''completed_payments'', COUNT(*) FILTER (WHERE payment_status = ''completed''),
      ''total_transactions'', COUNT(*)
    )
    FROM financial_records
    WHERE 1=1 %s
  ', date_filter) INTO summary;

  RETURN summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign courier to delivery
CREATE OR REPLACE FUNCTION assign_courier_to_delivery(
  delivery_uuid uuid,
  courier_uuid uuid
)
RETURNS boolean AS $$
DECLARE
  is_admin boolean := false;
  is_courier boolean := false;
BEGIN
  -- Check if current user is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;

  -- Check if the target user is actually a courier
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = courier_uuid AND role = 'courier'
  ) INTO is_courier;

  -- Only admins can assign couriers, and target must be a courier
  IF NOT is_admin OR NOT is_courier THEN
    RETURN false;
  END IF;

  -- Update the delivery
  UPDATE deliveries
  SET 
    courier_id = courier_uuid,
    status = 'assigned',
    updated_at = now()
  WHERE id = delivery_uuid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create delivery overview view
CREATE OR REPLACE VIEW delivery_overview AS
SELECT 
  d.*,
  sender.first_name || ' ' || sender.last_name AS sender_name,
  sender.role AS sender_role,
  recipient.first_name || ' ' || recipient.last_name AS recipient_name,
  recipient.role AS recipient_role,
  courier.first_name || ' ' || courier.last_name AS courier_name,
  sa_sender.address AS sender_address,
  sa_sender.city AS sender_city,
  sa_sender.country AS sender_country,
  sa_sender.contact AS sender_contact,
  sa_sender.email AS sender_email,
  sa_recipient.address AS recipient_address,
  sa_recipient.city AS recipient_city,
  sa_recipient.country AS recipient_country,
  sa_recipient.contact AS recipient_contact,
  sa_recipient.email AS recipient_email
FROM deliveries d
LEFT JOIN profiles sender ON d.sender_id = sender.id
LEFT JOIN profiles recipient ON d.recipient_id = recipient.id
LEFT JOIN profiles courier ON d.courier_id = courier.id
LEFT JOIN shipping_addresses sa_sender ON d.id = sa_sender.delivery_id AND sa_sender.type = 'sender'
LEFT JOIN shipping_addresses sa_recipient ON d.id = sa_recipient.delivery_id AND sa_recipient.type = 'recipient';

-- Create financial overview view
CREATE OR REPLACE VIEW financial_overview AS
SELECT 
  fr.*,
  d.tracking_number,
  d.category,
  d.status AS delivery_status,
  sender.first_name || ' ' || sender.last_name AS sender_name,
  recipient.first_name || ' ' || recipient.last_name AS recipient_name
FROM financial_records fr
JOIN deliveries d ON fr.delivery_id = d.id
LEFT JOIN profiles sender ON d.sender_id = sender.id
LEFT JOIN profiles recipient ON d.recipient_id = recipient.id;

-- Grant access to admin functions and views
GRANT EXECUTE ON FUNCTION get_delivery_stats(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION get_financial_summary(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_courier_to_delivery(uuid, uuid) TO authenticated;
GRANT SELECT ON delivery_overview TO authenticated;
GRANT SELECT ON financial_overview TO authenticated;