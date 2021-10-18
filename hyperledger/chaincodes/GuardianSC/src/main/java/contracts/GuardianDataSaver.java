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
import org.json.JSONObject;

import java.util.Arrays;
import java.util.HashMap;

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

        stub.putStringState("config.json",config);
    }

    @Transaction
    public String getconfig(final Context ctx, final String key ) {
        ChaincodeStub stub = ctx.getStub();

        return stub.getStringState(key);
    }

    @Transaction()
    public boolean verifyThing(Context ctx, final String data, final String query){
        throw new ChaincodeException("Method not developed yet", "Ask Admin to complete the contract.");
    }
}
