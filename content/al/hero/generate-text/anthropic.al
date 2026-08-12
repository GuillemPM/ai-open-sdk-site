Anthropic: Codeunit "AIOS Anthropic";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        Anthropic.Model('claude-fable-5', ApiKey),
        'Draft a purchase order confirmation');
    Message(Result.Output());
end;
