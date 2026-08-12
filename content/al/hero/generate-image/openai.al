OpenAI: Codeunit "AIOS OpenAI";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Image Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateImage(
        OpenAI.ImageModel('gpt-image-2', ApiKey),
        'A blueprint of a warehouse');
end;
