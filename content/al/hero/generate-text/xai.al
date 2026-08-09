XAI: Codeunit "AIOS XAI";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        XAI.Model('grok-4.5', ApiKey),
        'Suggest a picking route for this order');
    Message(Result.Output());
end;
