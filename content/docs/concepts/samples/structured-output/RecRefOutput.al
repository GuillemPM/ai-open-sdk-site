Request.SetOutput(RecRef);
Result := Client.GenerateText(Model, Request, RecRef);
// JSON fills bindable fields; raw JSON remains on Result.Output()
