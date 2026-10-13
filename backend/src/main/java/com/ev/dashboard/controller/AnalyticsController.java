package com.ev.dashboard.controller;

import com.ev.dashboard.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/kpis")
    public Map<String, Object> getKpis() {
        return analyticsService.getOverviewKpis();
    }

    @GetMapping("/revenue-by-station")
    public List<Map<String, Object>> getRevenueByStation() {
        return analyticsService.getRevenueByStation();
    }

    @GetMapping("/peak-hours")
    public List<Map<String, Object>> getPeakHours() {
        return analyticsService.getPeakHours();
    }

    @GetMapping("/charger-status")
    public List<Map<String, Object>> getChargerStatusDistribution() {
        return analyticsService.getChargerStatusDistribution();
    }

    @GetMapping("/energy-comparison")
    public List<Map<String, Object>> getEnergyComparison() {
        return analyticsService.getGridVsDeliveredEnergy();
    }

    @GetMapping("/station-details")
    public List<Map<String, Object>> getStationDetails() {
        return analyticsService.getStationDetails();
    }

    @GetMapping("/revenue-transactions")
    public List<Map<String, Object>> getRevenueTransactions() {
        return analyticsService.getRevenueTransactions();
    }
}