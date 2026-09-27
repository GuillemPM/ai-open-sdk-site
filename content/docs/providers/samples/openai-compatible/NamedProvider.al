Compatible: Codeunit "AIOS OpenAI Compatible";
Client: Codeunit "AIOS Client";
Model: Interface "AIOS Language Model";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Compatible.SetName('inhouse-gateway');
    Compatible.SetBaseUrl('https://ai.contoso.internal/v1');
    Compatible.SetApiKey(ApiKey);

    if not Compatible.BindLanguageModel('qwen3-32b', Model) then
        Error('Complete the AI gateway setup first.');

    Result := Client.GenerateText(Model, 'Hello');
    // Result.GetProviderName() returns 'inhouse-gateway'
end;
