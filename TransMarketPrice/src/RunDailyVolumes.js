/* RunQuery.js
 * desc: Example of how to run a google BigQuery against the Ethereum dataset from JavaScript
 *
 */

// Got this using npm install --save @google-cloud/bigquery
const {BigQuery} = require('@google-cloud/bigquery');
var nodemailer = require("nodemailer");

// A hard coded query for testing.  Will return the top ten addresses for ERC721 smart contracts.
// Top meanoing the addresses with the highest transaction counts.
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
query += "and blocks.timestamp > TIMESTAMP_SUB(current_timestamp, INTERVAL 200 HOUR) ";
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
      })
      .on('end', function() {
        resultSet.header.rowCount = rowCount;
        console.log("Resolving promise with result set.");
        resolve(resultSet);
      });
    });
    let r = await promise; // wait till the promise resolves (*)
    return(resultSet);
};

function OutputResults(results) {

  var avgTrans = 0;
  results.map(item => {
    avgTrans += item.Transactions;
  });
  avgTrans = avgTrans / results.length;
  var Message = "<HTML><BODY>";
  var Line = "Date       \tDay # \tTransactions \tDelta from Avg";
  Message = "<table cellspacing=\"8\" callpadding=\"4\"><tbody>";
  Message += "<tr align=\"center\"><th>Date</th><th>Day #</th><th>Transactions</th><th>Delta from Avg</th></tr>";
  console.log( Line );
  const rLen = results.length;
  // Leave off the last daily data point.
  for (i=0; i<(rLen-1); i++) {
    Message += ("<tr align=\"right\"><td align=\"right\">" + results[i].MaxTimestamp.value.substring(0,10) + "</td>"
      + "<td align=\"right\">" + results[i].IntDaysFrom19700101 + "</td>"
      + "<td align=\"right\">" + results[i].Transactions.toLocaleString('en') + "</td>"
      + "<td align=\"right\">" + Math.trunc(results[i].Transactions - avgTrans).toLocaleString('en') + "</td></tr>");
  }
  Line = "</tbody></table><br/>";
  console.log(Line);
  Message += Line;
  Line = "Avg Num Transactions: " + Math.trunc(avgTrans).toLocaleString('en');
  console.log(Line);
  Message += (Line + "</BODY></HTML>");
  console.log(Message);
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
async function TestQuery() {
  var result;
  try {
    result = await getBigQueryData(query);
    var Message = OutputResults(result.data);
    SendMessage(Message);
  } catch(e) {
    console.log("Error:", e);
  }
  //console.log("Query result:", result);
}

// Run the test.
console.log("TestQuery()");
TestQuery();