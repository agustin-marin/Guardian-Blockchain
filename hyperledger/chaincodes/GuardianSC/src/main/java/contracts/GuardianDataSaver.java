package contracts;

import com.owlike.genson.Genson;
import com.owlike.genson.GensonBuilder;
import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.ledger.KeyValue;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;

@Contract(
        name = "",
        info = @Info(
                title = "Save and verify data from IoT sources",
                description = "",
                version = "1.0"
        )
)

@Default
public final class GuardianDataSaver implements ContractInterface {
    // Serializacion JSON
    private final String CONFIG_NAME = "config.json";
    private final Genson genson = new GensonBuilder().create();//.rename("context","@context").create();

    /**
     * Push data to the ledger
     *
     * @param data , value to be pushed.
     * @param key  string used to make key = (key + {@link System#nanoTime()})
     */
    @Transaction()
    public String pushData(final Context ctx, final String key, final String data) {
        ChaincodeStub stub = ctx.getStub();

        // Check existence
        /*String publicInformation = stub.getStringState(key);
        if (!publicInformation.isEmpty()) {
            String errorMessage = String.format("PublicInformation %s already exists", key);
            throw new ChaincodeException(errorMessage, "PublicInformation already exists");
        }*/

        long l = System.nanoTime();
        stub.putStringState(key + l, data);

        return new JSONObject().put(key + l, data).toString();
    }

    /**
     * Pull data to the ledger using couchdb query selectors: . {"selector":{"key":"value","key.key":"value"}}
     *
     * @return
     */
    @Transaction()
    public String pullData(final Context ctx, final String query) {
        ChaincodeStub stub = ctx.getStub();
        System.out.println("query: " + query);
        QueryResultsIterator<KeyValue> queryResult = stub.getQueryResult(query);
        HashMap<String, String> results = new HashMap<>();
        //ArrayList<JSONObject> results = new ArrayList<>();


        for (KeyValue keyValue : queryResult) {
            results.put(keyValue.getKey(), new String(keyValue.getValue()));
        }
        return genson.serialize(results);
    }

    @Transaction()
    public void publicarconfig(final Context ctx, final String config) {
        ChaincodeStub stub = ctx.getStub();
        JSONObject jsonObject = new JSONObject(config);
        JSONArray entities = jsonObject.getJSONArray("entities");
        for (int i = 0; i < entities.toList().size(); i++) {
            JSONObject entityJSON = entities.getJSONObject(i);
            String id1 = entityJSON.getString("id");
            JSONArray attributesJSON = entityJSON.getJSONArray("attributes");
            for (int j = 0; j < attributesJSON.toList().size(); j++) {
                JSONObject attributeJSON = attributesJSON.getJSONObject(j);
                String id = attributeJSON.getString("id");
                String lasttimestamp = attributeJSON.getString("lasttimestamp");
                stub.putStringState(id1 + id + "lasttimestamp", lasttimestamp);
                attributeJSON.remove("lasttimestamp");
            }
        }
        stub.putStringState(CONFIG_NAME, jsonObject.toString());
    }
    @Transaction()
    public String getHistoricos(final Context ctx, final String entityID, final String attrID, final String fromDate, final String toDate) {
        ChaincodeStub stub = ctx.getStub();

        JSONObject selectorJSON = new JSONObject().put("selector",
                new JSONObject());
        if (!entityID.equals("*")){
            selectorJSON.put("entityid", entityID);
        }
        if (!attrID.equals("*")){
            selectorJSON.put("attrName", attrID);
        }
        if (!fromDate.isEmpty() || !toDate.isEmpty()){
            selectorJSON.put("recvTime",new JSONObject());
            if (!fromDate.isEmpty())
                selectorJSON.getJSONObject("recvTime")
                    .put("$gt", fromDate);
            if (!toDate.isEmpty())
                selectorJSON.getJSONObject("recvTime")
                       .put("$lt", toDate);

        }
        String s = selectorJSON.toString();
        HashMap<String, String> results = new HashMap<>();
        QueryResultsIterator<KeyValue> result = stub.getQueryResult(s);
        for (KeyValue keyValue : result) {
            results.put(keyValue.getKey(), new String(keyValue.getValue()));
        }
        return genson.serialize(results);

    }
    @Transaction
    public String getconfig(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();
        String stringState = stub.getStringState(CONFIG_NAME);
        JSONObject configJSON = new JSONObject(stringState);
        JSONArray entities = configJSON.getJSONArray("entities");
        for (int i = 0; i < entities.toList().size(); i++) {
            JSONObject entityJSON = entities.getJSONObject(i);
            String id1 = entityJSON.getString("id");
            JSONArray attributesJSON = entityJSON.getJSONArray("attributes");
            for (int j = 0; j < attributesJSON.toList().size(); j++) {
                JSONObject attributeJSON = attributesJSON.getJSONObject(j);
                String id = attributeJSON.getString("id");
                String lasttimestamp = stub.getStringState(id1 + id + "lasttimestamp");
                attributeJSON.put("lasttimestamp", lasttimestamp);
            }
        }
        return configJSON.toString();
    }
            /**
             * @param arrayString   an array containing the string with json of historical values.
             * @param entityID      the entityid that owns the attribute
             * @param attributeName the attribute id/name
             * @return bool if ok or not
             */
            @Transaction()
            public boolean publicarArrayDeHistoricos (Context ctx,final String arrayString, final String entityID,
            final String attributeName, final String lasttimestamp){
                ChaincodeStub stub = ctx.getStub();
                JSONArray jsonArray = new JSONArray(arrayString);
                List<Object> objects = jsonArray.toList();
                for (int i = 0; i < objects.size(); i++) {
                    JSONObject historicoJSON = jsonArray.getJSONObject(i);
                    String historico = historicoJSON.toString(); // {"entityid":"IoTConnector:00027","attrName":"analogInput_614cc3b98562c0e679f16c9d","attrvalue":"-200","recvTime":"2021-09-24T08:14:00.000Z"}
                    stub.putStringState(entityID + attributeName + historicoJSON.getString("recvTime"), historico);
                }
                // update lasttimestamp
                stub.putStringState(entityID+attributeName+"lasttimestamp", lasttimestamp);
                return false;
            }
        }
