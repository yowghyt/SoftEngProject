-- triggers.sql
-- MySQL triggers to keep `request` table in sync with reservations
-- Run this in your database (e.g., via phpMyAdmin or mysql CLI) after importing the schema.

DELIMITER $$

CREATE TRIGGER trg_after_insert_roomreservation
AFTER INSERT ON roomreservation
FOR EACH ROW
BEGIN
  -- Only create a request row if one does not already exist for this reservation
  IF NOT EXISTS (SELECT 1 FROM request WHERE reservationId = NEW.reservationId AND requestType = 'room') THEN
    INSERT INTO request (userId, reservationId, requestType, status)
    VALUES (NEW.userId, NEW.reservationId, 'room', 'Pending');
  END IF;
END$$

CREATE TRIGGER trg_after_update_roomreservation_status
AFTER UPDATE ON roomreservation
FOR EACH ROW
BEGIN
  -- When room reservation status changes, propagate to request.status
  IF NEW.status <> OLD.status THEN
    UPDATE request
    SET status = NEW.status
    WHERE reservationId = NEW.reservationId AND requestType = 'room';
  END IF;
END$$

DELIMITER ;
