/* RunQuery.js
 * desc: Example of how to run a google BigQuery against the Ethereum dataset from JavaScript
 *
 */

// Got this using npm install --save @google-cloud/bigquery
const {BigQuery} = require('@google-cloud/bigquery');
var nodemailer = require("nodemailer");

var wantEmail = true;

// Query to extract daily transaction counts for Ethereum.
var query = "select CAST(CEILING(UNIX_MILLIS(blocks.timestamp)/(1000*60*60*24)) as INT64) as IntDaysFrom19700101,"
query += "sum(blocks.transaction_count) as Transactions,";
query += "min(blocks.timestamp) as MinTimestamp,";
query += "max(blocks.timestamp) as MaxTimestamp,";
query += "min(UNIX_MILLIS(blocks.timestamp)) as MinUnixTimestamp,";
query += "max(UNIX_MILLIS(blocks.timestamp)) as MaxUnixTimestamp,";
query += "min(blocks.number) as MinBlockNumber,";
query += "max(blocks.number) as MaxBlockNumber,";
query += "sum(blocks.difficulty) as Difficulty ";
query += "from `bigquery-public-data.ethereum_blockchain.blocks` as blocks ";
query += "where blocks.number != 0 ";
query += "and blocks.timestamp > TIMESTAMP_SUB(current_timestamp, INTERVAL 400 HOUR) ";
query += "group by IntDaysFrom19700101 ";
query += "order by IntDaysFrom19700101 DESC";

/* getBigQueryData(query)
 * desc: Run the BigQuery using async and await execution model.
 * param: String with the query to run.
 */
async function getBigQueryData(query)
{
  const bigquery2 = new BigQuery({
    projectId: 'eth-testing-221913',
    keyFilename: '/Users/yglm/eth-testing-221913-87aaade4d104.json'
  });

  console.log("query:", query);

  var resultSet = {
    header: {
      query: query,
      rowCount: 0,
      errorCode: 0,
      errorMsg: ""
    },
    data: []
  };
  var rowCount = 0;

  let promise = new Promise((resolve, reject) => {
    bigquery2.createQueryStream(query)
      .on('error', console.error)
      .on('data', function(row) {
        resultSet.data.push(row);
        rowCount++;
        console.log("Got row:", rowCount);
        console.log(row);
      })
      .on('end', function() {
        resultSet.header.rowCount = rowCount;
        console.log("Resolving promise with result set.");
        resolve(resultSet);
      });
    });
    let r = await promise; // wait till the promise resolves (*)
    return(resultSet);
}


function formatTimestamp(timestamp) {

    return(timestamp.substring(0,16).replace("T", " "));
}


function OutputResults(results) {

  // Remove the one partial day from the resultSet
  results.splice(-1,1);
  var avgTrans = 0;
  results.map(item => {
    avgTrans += item.Transactions;
  });
  avgTrans = avgTrans / results.length;
  var Message = "<HTML><BODY>";
  Message = "<table cellspacing=\"8\" callpadding=\"4\"><tbody>";
  Message += "<tr align=\"center\"><th>Time Interval</th><th>Day #</th><th>Transactions</th><th>Delta from Avg</th></tr>";
  results.map(item => {
    Message += ("<tr align=\"right\">"
      + "<td align=\"right\">" + formatTimestamp(item.MaxTimestamp.value) + " to " + formatTimestamp(item.MinTimestamp.value) + "</td>"
      + "<td align=\"right\">" + item.IntDaysFrom19700101 + "</td>"
      + "<td align=\"right\">" + item.Transactions.toLocaleString('en') + "</td>"
      + "<td align=\"right\">" + Math.trunc(item.Transactions - avgTrans).toLocaleString('en') + "</td></tr>");
  });
  Message += "</tbody></table><br/>";
  Message += ("Avg Num Transactions: " + Math.trunc(avgTrans).toLocaleString('en') + "</BODY></HTML>");
  return(Message);
}

function SendMessage(Message) {

  console.log("Email message: ", Message);
  var u   = process.env.emailU;
  var p = process.env.emailP;

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: u,
      pass: p
    }
  });

  var mailOptions = {
    from: 'louismenna3@gmail.com',
    to: 'louismenna@yahoo.com',
    subject: 'Daily ETH Volumes',
    html: Message
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("Email sent: " + info.response);
    }
  })
}


/* TestQuery()
 * desc: async Wrapper function to call into getBigQueryData() and wait for the result.
 *
 */
async function RunTransactionVolumes(wantEmail) {
  var result;
  try {
    result = await getBigQueryData(query);
    var Message = OutputResults(result.data);
    if (wantEmail) {
      SendMessage(Message);
    }
  } catch(e) {
    console.log("Error:", e);
  }
  //console.log("Query result:", result);
}

// Run the test.
console.log("Run Dail Transaction Volumes");
RunTransactionVolumes(wantEmail);
