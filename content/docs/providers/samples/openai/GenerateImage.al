OpenAI: Codeunit "AIOS OpenAI";
Client: Codeunit "AIOS Client";
ImageResult: Codeunit "AIOS Generate Image Result";
ApiKey: SecretText;
begin
    ImageResult := Client.GenerateImage(
        OpenAI.ImageModel('gpt-image-2', ApiKey),
        'A blueprint of a warehouse');
end;
