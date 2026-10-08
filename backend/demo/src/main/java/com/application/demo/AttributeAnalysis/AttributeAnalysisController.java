package com.application.demo.AttributeAnalysis;
import com.application.demo.GeoServerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/attribute-analysis")
public class AttributeAnalysisController {
    
    private final AttributeAnalysisService attributeAnalysisService;
    private final GeoServerService geoServerService;

    public AttributeAnalysisController(AttributeAnalysisService attributeAnalysisService, GeoServerService geoServerService) {
        this.attributeAnalysisService = attributeAnalysisService;
        this.geoServerService = geoServerService;
    }

    @PostMapping("/new-attribute-selection")
    public ResponseEntity<?> newAttribute(@RequestParam Map<String, Object> formData) {
        System.out.println("Received form data at AttributeController: " + formData);
        Map<String, Object> attributeFormData = new HashMap<>();

        attributeFormData.put("attributeLayer", formData.get("attributeLayer"));
        attributeFormData.put("attributeAttribute", formData.get("attributeAttribute"));
        attributeFormData.put("attributeSign", formData.get("attributeSign"));
        attributeFormData.put("attributeCondition", formData.get("attributeCondition"));
        attributeFormData.put("userId", formData.get("userId"));
        attributeFormData.put("time", formData.get("time"));
        String userId = (String) formData.get("userId");
        String time = (String) formData.get("time");

        String tableName = "user_" + userId + "_temp_table_" + time;
        try {
            String response = attributeAnalysisService.newAttributeSelection(attributeFormData, tableName);

            if (response.startsWith("Error")) {
                return ResponseEntity.badRequest().body("Error: Invalid attribute selection.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
            
        }

        try {
            geoServerService.publishLayer(tableName, tableName, userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error publishing layer: " + e.getMessage());
        }




        //Deletion of temp table is handled already in return-button 

        return ResponseEntity.ok("TTTTTTTYYYYYPEEE");
    }

    @PostMapping("/update-attribute-selection")
    public ResponseEntity<?> updateAttribute() {
        // Implement the logic for updating attribute selection
        return ResponseEntity.ok().build();
    }

}