package com.IpTutor.Backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "games")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Game {

    @Id
    private ObjectId id;

    private String gameName;
    private int highScore;
}
