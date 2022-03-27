package contracts;

import com.owlike.genson.Genson;
import com.owlike.genson.GensonBuilder;
import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.protos.peer.ChaincodeShim;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.ledger.KeyValue;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;
import org.hyperledger.fabric.shim.ledger.QueryResultsIteratorWithMetadata;
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
    private static int pageSize = 3;

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

    /**
     * Inicialización de sensores y entidades en el blockchain y sus timestamp
     *
     * @param ctx
     * @param config
     */
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
    public void publicarArrayDeHistoricos(Context ctx, final String arrayString, final String entityID,
                                          final String attributeName, final String lasttimestamp) {
        ChaincodeStub stub = ctx.getStub();
        JSONArray jsonArray = new JSONArray(arrayString);
        List<Object> objects = jsonArray.toList();
        for (int i = 0; i < objects.size(); i++) { // recorrer el array de historicos
            JSONObject historicoJSON = jsonArray.getJSONObject(i);
            String historico = historicoJSON.toString(); // {"entityid":"IoTConnector:00027","attrName":"analogInput_6
            // 14cc3b98562c0e679f16c9d","attrvalue":"-200","recvTime":"2021-09-24T08:14:00.000Z"}

            // guardar el historico
            stub.putStringState(entityID + attributeName + historicoJSON.getString("recvTime"), historico);
        }
        // update lasttimestamp
        stub.putStringState(entityID + attributeName + "lasttimestamp", lasttimestamp);
    }


    @Transaction()
    public String getHistoricos(final Context ctx, final String entityID, final String attrID, final String fromDate, final String toDate) {
        long first = System.nanoTime();
        ChaincodeStub stub = ctx.getStub();
        stub.getStringArgs().size();
        int total = 0;

        JSONObject selectorJSON = new JSONObject();
        if (!entityID.equals("*")) {
            selectorJSON.put("entityid", entityID);
        }
        if (!attrID.equals("*")) {
            selectorJSON.put("attrName", attrID);
        }
        if (!fromDate.isEmpty() || !toDate.isEmpty()) {
            selectorJSON.put("recvTime", new JSONObject());
            if (!fromDate.isEmpty())
                selectorJSON.getJSONObject("recvTime")
                        .put("$gte", fromDate);
            if (!toDate.isEmpty())
                selectorJSON.getJSONObject("recvTime")
                        .put("$lte", toDate);
            selectorJSON = new JSONObject().put("selector",
                            selectorJSON)
                    .put("use_index", "_design/index4Doc");
        }
        String s = selectorJSON.toString();
        //HashMap<String, String> results = new HashMap<>();
        JSONArray resultsTEST = new JSONArray();
        //QueryResultsIterator<KeyValue> result = stub.getQueryResult(s);
        String bookmark = "";
        int fetchedRecordsCount = 0;
        long before;
        before = System.nanoTime();
        System.out.println("SELECTOR: " + s);
        QueryResultsIteratorWithMetadata<KeyValue> queryResultWithPagination = stub.getQueryResultWithPagination(s, pageSize, bookmark);
        long l = (System.nanoTime() - before) / 1_000_000_000;
        System.out.println("TIME TO query with pagination: " + l);

        do {
            l = (System.nanoTime() - first) / 1_000_000_000;
            if (l > 25) {
                break;
            }
            ChaincodeShim.QueryResponseMetadata metadata = queryResultWithPagination.getMetadata();
            fetchedRecordsCount = metadata.getFetchedRecordsCount();
            for (KeyValue keyValue : queryResultWithPagination) {
                resultsTEST.put(new JSONObject().put(keyValue.getKey(), new String(keyValue.getValue())));
            }
            queryResultWithPagination = stub.getQueryResultWithPagination(s, pageSize, metadata.getBookmark());
            total += fetchedRecordsCount;
        } while (fetchedRecordsCount > 0);

        long ll = (System.nanoTime() - first) / 1_000_000_000;
        System.out.println("TIME TO query with pagination: " + ll);
        if (ll > 30) {
            System.err.println("Error: TIMEOUT: more than 30 seconds on client, reset.");
        }
        //int seleccion = getpageSize(stub, s);
        return new JSONObject().put("queryResult", resultsTEST).put("count", total).toString();
    }

    private int getpageSize(ChaincodeStub stub, String s) {
        int seleccion = 0;
        double nuevo = -1, anterior = -1;
        for (int i = 1; i < 30; i++) {
            double before = System.nanoTime();
            double count = stub.getQueryResultWithPagination(s, i, "").getMetadata().getFetchedRecordsCount();
            double v = (System.nanoTime() - before);
            nuevo = i / v;
            if (nuevo > anterior) {
                anterior = nuevo;
                seleccion = i;
            }
        }
        System.out.println("SELECCION: " + seleccion);
        return seleccion;
    }
}