Mock: Codeunit "AIOS Mock";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Image Result";
begin
    // No API key. Tests run offline
    Result := Client.GenerateImage(
        Mock.ImageModel('mock-image'),
        'A blueprint of a warehouse');
end;
