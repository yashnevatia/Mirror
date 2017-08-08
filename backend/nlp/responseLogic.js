/* File with the logic for processing the API.AI response */

// Exported Function
function analyzeRequest (data) {
  const resp = data.result;

  return new Promise((resolve, reject) => {
    const notFinished = resp.actionIncomplete;
    const category = resp.action;
    const response = resp.fulfillment.speech;

    // return object with info widget needs
    const returnObj = {
      notFinished,
      category,
      params: resp.parameters,
      response
    };
    resolve(returnObj);
  }); // end promise
}

module.exports = {
  analyzeRequest
}


// NOTES
/*
api.ai spits out large object; we have the data of it here
data has result keys

data.result:
  source - 'agent'
  resolvedQuery - the text it got
  action - the name of the intent (input.unknown if not defined)
  actionIncomplete - bool of whether done or not
  parameters - the list of params we trained it to catch
  contexts - ?
  fulfillment - object
    speech - followup prompt that google creates
  ... other unnec stuff
  */
