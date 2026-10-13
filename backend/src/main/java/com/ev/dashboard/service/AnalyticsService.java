package com.ev.dashboard.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getOverviewKpis() {
        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalStations", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Stations", Integer.class));
        kpis.put("totalChargers", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Chargers", Integer.class));
        kpis.put("availableChargers", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Chargers WHERE status = 'Available'", Integer.class));
        kpis.put("completedSessions", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM ChargingSessions", Integer.class));
        kpis.put("totalRevenue", jdbcTemplate.queryForObject("SELECT COALESCE(SUM(amount), 0) FROM Payments WHERE payment_status = 'Completed'", Double.class));
        kpis.put("totalEnergyKwh", jdbcTemplate.queryForObject("SELECT COALESCE(SUM(energy_delivered_kwh), 0) FROM ChargingSessions", Double.class));
        return kpis;
    }

    public List<Map<String, Object>> getRevenueByStation() {
        String sql = """
            SELECT s.station_name, COALESCE(SUM(p.amount), 0) AS total_revenue
            FROM Stations s
            LEFT JOIN Chargers c ON s.station_id = c.station_id
            LEFT JOIN ChargingSessions cs ON c.charger_id = cs.charger_id
            LEFT JOIN Payments p ON cs.session_id = p.session_id AND p.payment_status = 'Completed'
            GROUP BY s.station_id, s.station_name
        """;
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getPeakHours() {
        String sql = """
            SELECT HOUR(start_time) AS hour_of_day, COUNT(session_id) AS session_count
            FROM ChargingSessions
            GROUP BY HOUR(start_time) ORDER BY hour_of_day ASC
        """;
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getChargerStatusDistribution() {
        return jdbcTemplate.queryForList("SELECT status, COUNT(*) AS count FROM Chargers GROUP BY status");
    }

    public List<Map<String, Object>> getGridVsDeliveredEnergy() {
        String sql = """
            SELECT s.station_name,
                   COALESCE(SUM(e.kwh_consumed), 0) AS grid_kwh,
                   COALESCE(SUM(cs.energy_delivered_kwh), 0) AS delivered_kwh
            FROM Stations s
            LEFT JOIN ElectricityUsage e ON s.station_id = e.station_id
            LEFT JOIN Chargers c ON s.station_id = c.station_id
            LEFT JOIN ChargingSessions cs ON c.charger_id = cs.charger_id
            GROUP BY s.station_id, s.station_name
        """;
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getStationDetails() {
        String sql = """
            SELECT s.station_name, s.location, c.charger_type, c.max_power_kw, c.status,
                   COALESCE(SUM(cs.energy_delivered_kwh), 0) AS total_kwh_delivered
            FROM Stations s
            JOIN Chargers c ON s.station_id = c.station_id
            LEFT JOIN ChargingSessions cs ON c.charger_id = cs.charger_id
            GROUP BY s.station_id, s.station_name, s.location, c.charger_id, c.charger_type, c.max_power_kw, c.status
            ORDER BY s.station_name ASC
        """;
        return jdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> getRevenueTransactions() {
        String sql = """
            SELECT p.payment_id, s.station_name, p.amount, p.payment_method, p.payment_status, p.payment_time
            FROM Payments p
            JOIN ChargingSessions cs ON p.session_id = cs.session_id
            JOIN Chargers c ON cs.charger_id = c.charger_id
            JOIN Stations s ON c.station_id = s.station_id
            ORDER BY p.payment_time DESC
        """;
        return jdbcTemplate.queryForList(sql);
    }
}