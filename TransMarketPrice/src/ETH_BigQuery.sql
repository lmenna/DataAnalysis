/* ETH_BigQuery.sql
 * desc: Extracts daily transaction counts for Ethereum using the blocks table in google's BigQuery
 *
 */

-- Pulls daily transaction volume data for all days. 
select
CAST(CEILING(UNIX_MILLIS(blocks.timestamp)/(1000*60*60*24)) as INT64) as IntDaysFrom19700101,
min(blocks.timestamp) as MinTimestamp,
max(blocks.timestamp) as MaxTimestamp,
min(UNIX_MILLIS(blocks.timestamp)) as MinUnixTimestamp,
max(UNIX_MILLIS(blocks.timestamp)) as MaxUnixTimestamp,
min(blocks.number) as MinBlockNumber,
max(blocks.number) as MaxBlockNumber,
sum(blocks.transaction_count) as Transactions,
sum(blocks.difficulty) as Difficulty
from `bigquery-public-data.ethereum_blockchain.blocks` as blocks
where blocks.number != 0
group by IntDaysFrom19700101

-- Daily checker query.  Used by Javascript program to email out daily volume data.
select
CAST(CEILING(UNIX_MILLIS(blocks.timestamp)/(1000*60*60*24)) as INT64) as IntDaysFrom19700101,
sum(blocks.transaction_count) as Transactions,
min(blocks.timestamp) as MinTimestamp,
max(blocks.timestamp) as MaxTimestamp,
min(UNIX_MILLIS(blocks.timestamp)) as MinUnixTimestamp,
max(UNIX_MILLIS(blocks.timestamp)) as MaxUnixTimestamp,
min(blocks.number) as MinBlockNumber,
max(blocks.number) as MaxBlockNumber,
sum(blocks.difficulty) as Difficulty
from `bigquery-public-data.ethereum_blockchain.blocks` as blocks
where blocks.number != 0
and blocks.timestamp > TIMESTAMP_SUB(current_timestamp, INTERVAL 169 HOUR)
group by IntDaysFrom19700101
order by IntDaysFrom19700101 DESC
