package com.application.demo.AttributeAnalysis;

import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

@Service
public class AttributeAnalysisService {

    private JdbcTemplate jdbcTemplate;

    public AttributeAnalysisService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }


    public String newAttributeSelection(Map<String, Object> formData, String tableName) {
        // Implement the logic for new attribute selection
        try {
            String userId = (String) formData.get("userId");
            String time = (String) formData.get("time");
            String layer = (String) formData.get("attributeLayer");
            String attribute = (String) formData.get("attributeAttribute");
            String conditionStr = (String) formData.get("attributeCondition");
            
            String sign = (String) formData.get("attributeSign");

            List<String> numericAttributes = List.of(
                "jpt_powier", "jpt_powi_1", "shape_leng", "shape_le_1", "shape_area"
            );

            String sqlSELECT = "";
            String pickedLayer = translateLayer(layer);
            
            if (numericAttributes.contains(attribute)) {
                double condition = Double.parseDouble(conditionStr.replace(",", "."));
                sqlSELECT = "SELECT * FROM \"" + pickedLayer + "\" " +
                "WHERE CAST(\"" + attribute + "\" AS double precision) " +
                sign + " " + condition;
            } else {
                if (sign.equals("=") || sign.equals("!=")) {
                sqlSELECT = "SELECT * FROM \"" + pickedLayer + "\" " +
                    "WHERE \"" + attribute + "\" " +
                    sign + " " + "\'" + conditionStr + "\'"; 
                } else {
                    return "Error: Invalid sign for non-numeric attribute. Only '=' and '!=' are allowed.";
                }
                
            }
            
            
            String sql = "CREATE TABLE " + tableName + " AS " + sqlSELECT;
            jdbcTemplate.execute(sql);
            // PostgreSQL bez cudzysłowów zapisuje nazwy tabel małymi literami!
            // userId ma wielkie litery (np. pel4PIa...) więc trzeba użyć toLowerCase()
            // żeby ALTER TABLE trafił w tabelę o właściwej nazwie.
            String tableNameLower = tableName.toLowerCase();
            jdbcTemplate.execute(
                "ALTER TABLE " + tableNameLower + " ALTER COLUMN wkb_geometry TYPE geometry(Geometry, 3857) USING ST_Transform(ST_SetSRID(wkb_geometry, 2180), 3857)"
            );
            
            

            // SQL command do stworzenia nowej temp_table a potem dodaj to do temp_datastore 
            // uzytkownika i zrob publishLayer. Mniej wiecej tak samo jak w recznym sposobie. Dodaj przycisk zapisu do frontendu 

            System.out.println("Received form data in AttributeAnalysisService: " + formData);
            return "Success creating new ATTRIBUTE SELECTION table for user: " + userId + " at time: " + time;

        } catch (Exception e) {
            e.printStackTrace();
            return "Error creating new ATTRIBUTE SELECTION table: " + e.getMessage();
        }
    }

    public void updateAttributeSelection() {
        // Implement the logic for updating attribute selection
    }
    
    private String translateLayer(String layer) {
        switch (layer) {
            case "boundsLayerPanstwo":
                return "boundspanstwo";
            case "boundsLayerWojewodztwo":
                return "boundswojewodz";
            case "boundsLayerPowiaty":
                return "boundspowiaty";
            case "boundsLayerGminy":
                return "boundsgminy";
            case "boundsLayerCities":
                return "boundscities";
            case "vectorLayer":
                return "sql_data";
        }
        return "Wrong attribute layer name" + layer;
    }
    // Implement the service methods for attribute analysis here
}