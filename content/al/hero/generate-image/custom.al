MyProvider: Codeunit "My Image Provider";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Image Result";
ApiKey: SecretText;
begin
    // Implement "AIOS Image Model"
    Result := Client.GenerateImage(
        MyProvider.ImageModel('my-image-model', ApiKey),
        'A blueprint of a warehouse');
end;
