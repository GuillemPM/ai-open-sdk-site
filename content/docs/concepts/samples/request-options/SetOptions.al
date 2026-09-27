Client: Codeunit "AIOS Client";
Request: Record "AIOS Chat Request";
Result: Codeunit "AIOS Generate Result";
begin
    Request.SetSystemMessage('You write short, factual item descriptions.');
    Request.SetPrompt('Describe item 1000, a steel office desk.');
    Request.SetTemperature(0.2);
    Request.SetMaxTokens(300);
    Request.SetTimeout(30000);
    Request.SetMaxRetries(1);

    Result := Client.GenerateText(Model, Request);
end;
