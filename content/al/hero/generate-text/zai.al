ZAI: Codeunit "AIOS ZAI";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        ZAI.Model('glm-5', ApiKey),
        'Translate this posting message to Spanish');
    Message(Result.Output());
end;
