package contracts;

import com.owlike.genson.Genson;
import com.owlike.genson.GensonBuilder;
import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.ledger.KeyValue;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;
import org.json.JSONArray;
import org.json.JSONObject;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.*;

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
     * @param data , value to be pushed.
     * @param key string used to make key = (key + {@link System#nanoTime()})
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
        stub.putStringState(key+l,data);

        return new JSONObject().put(key+l, data).toString();
    }

    /**
     * Pull data to the ledger using couchdb query selectors: . {"selector":{"key":"value","key.key":"value"}}
     * @return
     */
    @Transaction()
    public String pullData(final Context ctx, final String query) {
        ChaincodeStub stub = ctx.getStub();
        System.out.println("query: "+query);
        QueryResultsIterator<KeyValue> queryResult = stub.getQueryResult(query);
        HashMap<String, String> results = new HashMap<>();
        //ArrayList<JSONObject> results = new ArrayList<>();


        for (KeyValue keyValue : queryResult) {
            results.put(keyValue.getKey(),new String(keyValue.getValue()));
        }
        return genson.serialize(results);
    }

    @Transaction()
    public void publicarconfig(final Context ctx, final String config) {
        ChaincodeStub stub = ctx.getStub();
        // TODO get anterior config y sustituir timestamp config.json
        stub.putStringState(CONFIG_NAME,config);
    }

    @Transaction
    public String getconfig(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();

        return stub.getStringState(CONFIG_NAME);
    }

    /**
     *
     *
     * @param arrayString an array containing the string with json of historical values.
     * @param entityID the entityid that owns the attribute
     * @param attributeName the attribute id/name
     * @return bool if ok or not
     */
    @Transaction()
    public boolean publicarArrayDeHistoricos(Context ctx, final String arrayString, final String entityID, final String attributeName, final String lasttimestamp){
        ChaincodeStub stub = ctx.getStub();

        List<Object> objects = new JSONArray(arrayString).toList();
        for (Object o: objects
             ) {
            JSONObject historicoJSON = new JSONObject(o);
            String historico = historicoJSON.toString(); // {"entityid":"IoTConnector:00027","attrName":"analogInput_614cc3b98562c0e679f16c9d","attrvalue":"-200","recvTime":"2021-09-24T08:14:00.000Z"}
            stub.putStringState(entityID+attributeName+historicoJSON.getString("recvTime"), historico);
        }

        // ACTUALIZAR LASTTIMESTAMP DE ESTE ATRIBUTO
        JSONObject configJSON = new JSONObject(getconfig(ctx));
        for (Object entity : configJSON.getJSONArray("entities")) {
            JSONObject jsonEntity = new JSONObject(entity);
            if (jsonEntity.getString("id").equals(entityID)){
                for (Object attribute : jsonEntity.getJSONArray("attributes")) {
                    JSONObject jsonAttribute = new JSONObject(attribute);
                    if (jsonAttribute.getString("id").equals(attributeName)){
                        jsonAttribute.put("lasttimestamp", lasttimestamp);
                        stub.putStringState(CONFIG_NAME, configJSON.toString());
                        return true;
                    }
                }
            }
        }
        return false;


    }
}
